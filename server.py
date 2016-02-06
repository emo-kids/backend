from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/testingsockets')
def testingsockets():
    return render_template('testingsockets.html')


@socketio.on('my event')
def handle_message(message):
    print('received message: ' + str(message))


if __name__ == '__main__':
    socketio.run(app)
