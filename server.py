from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send
from operator import add
import MySQLdb

db = MySQLdb.connect(host="localhost", user="root", passwd="emokids", db="emokids")
cursor = db.cursor()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/testingsockets')
def testingsockets():
    return render_template('testingsockets.html')


@app.route('/vis')
def vis():
    return render_template('vis.html')

@socketio.on('emotions')
def handle_emotions(emotions):
    print(request.sid, emotions)
    emit("emotions", [request.sid] + emotions, namespace='/vis', broadcast=True)
    cursor.execute("INSERT INTO emotions VALUES (NULL, %1.8f, %1.8f, %1.8f, %1.8f, NOW())", emotions(0), emotions(1), emotions(2), emotions(3))
    db.commit()

if __name__ == '__main__':
    socketio.run(app)
