from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send

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

if __name__ == '__main__':
    socketio.run(app)
