from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, send, disconnect
from operator import add
from math import sqrt
#import MySQLdb

#db = MySQLdb.connect(host="localhost", user="root", passwd="emokids1", db="emokids")
#cursor = db.cursor()

recent_history = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def hello_world():
    return render_template('index2.html')


@app.route('/vis')
def vis():
    return render_template('vis.html')

average_result = {}

@socketio.on('emotions')
def handle_emotions(emotions):
    # print(request.sid, emotions)
    recent_history[request.sid] = emotions
    number_of_people = len(recent_history)
    final_sums = [0,0,0,0]
    for key in recent_history:
    	for index, emotion in enumerate(recent_history[key]):
			final_sums[index] += emotion
    avg = []
    for sums in final_sums:
		  avg.append(sums/number_of_people)
    emit("emotions", {'user': request.sid, 'count':len(recent_history), 'emotions': emotions, 'averages': avg}, namespace='/vis', broadcast=True)
    # cursor.execute("INSERT INTO emotions VALUES (NULL, %s, %s, %s, %s, %s, NOW());", [(request.sid), emotions[0], emotions[1], emotions[2], emotions[3]])
    # db.commit()

@socketio.on('disconnect')
def handle_disconnect():
    try:
        print(request.sid, " disconnected")
        emit('disconnected', request.sid, namespace='/vis', broadcast=True)
    except:
        pass

@socketio.on_error_default
def default_error_handler(e):
    pass

if __name__ == '__main__':
    socketio.run(app)
