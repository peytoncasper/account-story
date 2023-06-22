from flask import Flask
from flask import request
import subprocess
import glob
app = Flask(__name__)

@app.route("/", methods=['GET'])
def run_ffmpeg():
    storyId = request.args.get('storyId', '')

    pngCount = len(glob.glob1("/tmp/" + storyId,"*.png"))


    command = ['ffmpeg','-y','-framerate', "1/5",'-i', "/tmp/"+ storyId +"/%1d.png",'-c:v', 'libx264', '-t',str(pngCount * 5),'-r', '30','-pix_fmt', 'yuv420p',"../public/"+ storyId +".mp4"];
    process = subprocess.run(command)
#     wav, errordata = process.communicate(f)

    return "{'message': 'success'}"

