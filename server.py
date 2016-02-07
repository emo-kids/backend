from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, send
from operator import add
import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="emokids1", db="emokids")
cursor = db.cursor()

recent_history = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def hello_world():
    return render_template('index.html')


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

    # emit("emotions", {'user': request.sid, 'count':len(recent_history), 'emotions': emotions, 'averages': avg}, namespace='/vis', broadcast=True)
    cursor.execute("INSERT INTO emotions VALUES (NULL, %s, %s, %s, %s, %s, NOW());", [(request.sid), emotions[0], emotions[1], emotions[2], emotions[3]])#(request.sid, float(emotions[0]), float(emotions[1]), float(emotions[2]), float(emotions[3])))
    db.commit()

if __name__ == '__main__':
    socketio.run(app)
