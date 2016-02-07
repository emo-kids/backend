from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, send

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

@app.route('/avg')
def avg():
	if len(recent_history) > 0:
		number_of_people = len(recent_history)
		final_sums = [0,0,0,0]
		for key in recent_history:
			for index, emotion in enumerate(recent_history[key]):
				final_sums[index] += emotion
		avg = []
		for sums in final_sums:
			print(sums/number_of_people)
			avg.append(sums/number_of_people)
			print("a ok")
		# print(avg)
		json = {'averages': avg}
		return jsonify(**json)
		# return "hi"
	else:
		dictonary = {"error":"length of recent_history is < 0"}
		return(jsonify(**dictonary))


@socketio.on('emotions')
def handle_emotions(emotions):
	print(request.sid, emotions)
	recent_history[request.sid] = emotions
	emit("emotions", [request.sid] + emotions, namespace='/vis', broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
