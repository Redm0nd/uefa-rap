from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Serve the homepage
@app.route('/')
def index():
    return render_template('index.html')  # You will need to create this HTML file

@app.route('/decision-making')
def decision_making():
    return render_template('decision_making.html')


# Serve video content
@app.route('/videos/<path:filename>')
def video(filename):
    return send_from_directory('videos', filename)

# Serve images
@app.route('/images/<path:filename>')
def image(filename):
    return send_from_directory('images', filename)

if __name__ == '__main__':
    app.run(debug=True)
