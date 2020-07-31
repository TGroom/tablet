# Tablet Control

This package interfaces with ROS to allow communication and control through a local web server. The controller can publish and subscribe on topics and can display video feed published to compressedImage topics. The Q&A Interface displays questions on the tablet and is accessed through an actionlib.


## Installation

Follow the tutorial [here](https://industrial-training-master.readthedocs.io/en/melodic/_source/session1/Installing-Existing-Packages.html#download-and-build-a-package-from-source) about downloading and building a package from github or follow the steps below:

1\. Clone tablet_interface from github into your workspace:
`cd ~/catkin_ws/src`
`git clone https://github.com/---/---/git`

2\. Then in your workspace directory run:
`catkin build`

3\. Finally re-source your workspace using the following command:
`source ~/catkin_ws/devel/setup.bash`

Before use, you also have to install Rosbridge if you have not done so already. I recommend following the installation guide [here](http://wiki.ros.org/rosbridge_suite). 

## Usage
Make sure your workspace is sourced. To start the web server from the terminal use:
```
roslaunch tablet tablet.launch
```


You should see the response `Serving HTTP on 0.0.0.0 port 8000 ...`. The url of the tablet interface webpage will be `http://<your ip address>:8000`. e.g. `http://198.51.100.173:8000`
Note: **Do not use https, use http**

In a second terminal Launch Rosbridge:
```
roslaunch rosbridge_server rosbridge_websocket.launch
```
If all has gone well, you should see a line that looks similar to:
`[INFO] [1596204046.649251]: Rosbridge WebSocket server started at ws://0.0.0.0:9090`
The last 4 digit number on this line is the Robridge WebSocket port. The default Rosbridge port is **9090**.

Once both Rosbridge and the server are up and running, you can connect the web page to Rosbridge by entering the WebSocket ip address and clicking 'connect' on either the 'Control Pannel' or 'Tablet Interface' webpages . The WebSocket ip address will look like `ws://<your ip address>:<Rosbridge port>`. An example is shown below:

![ ](/home/thomas/catkin_ws2/src/tablet/Header_Bar.png  "Connection Interface")

If errors occur please refer to the 'Troubleshooting' section in this README.


### Tablet Q&A Communication
To send a question goal to the server from the terminal use the command below (Push Tab after writing the first line to autocomplete):
```plaintext
rostopic pub /tabletActionLib/goal tablet/QuestionActionGoal
"header:
  seq: 0
  stamp:
    secs: 0
    nsecs: 0
  frame_id: ''
goal_id:
  stamp:
    secs: 0
    nsecs: 0
  id: ''
goal:
  question_text: ''
  yes_no: false
  options: false
  list_of_options: ['']
  text: false"
```

Variable | Type | Meaning
---:|:---:|---
`question_text` | String | Any text written here will be displayed as a question on the webpage
`yes_no` | Bool | Set true for a yes/no response
`options` | Bool | Set true for an options response
`list_of_options` | List of Strings | List the names of the options (there is no limit to the number of options)
`text`	 | Bool | Set true for a text submittable response

To view the result run `rostopic echo /tabletActionLib/result` which will display the result every time a response is submitted. The result will be stored in `result: {answer: "example answer"}`

ServerName : '/tabletActionLib',
ActionName : 'tablet/QuestionAction'

### Tablet Ros Controller

To demonstrate the tablet control page it is useful to launch the simulator:
```
cd tiago_public_ws/
source devel/setup.bash
roslaunch tiago_gazebo tiago_gazebo.launch public_sim:=true robot:=steel world:=empty
```
The UI has several drop down menus which list the available topics to subscribe or publish to. The content of the rosout topic is displayed at the bottom of the page.

## Troubleshooting

**Error when launching tablet package:**
For troubleshooting purposes you can try to start the web server manually from the terminal, note that you have to start the server in the `/tablet/webpages` directory:
```
roscd tablet/webpages
python3 -m http.server
```

**Error when connecting to rosbridge:**
1\. Is rosbridge running?
2\. Is the WebSocket address correct? 
3\. Is the port number correct? - Typically the port number is 9090
## References
Python web server code: https://stackoverflow.com/questions/10085996/shutdown-socketserver-serve-forever-in-one-thread-python-application
Web Interface Tutorial: https://rds.theconstructsim.com/l/dd7f9b6/
Tutorial Video: https://www.youtube.com/watch?v=fJDwgOJPRJE
Roslibjs, SimpleActionServer example: https://github.com/RobotWebTools/roslibjs/blob/develop/examples/fibonacci_server.html
Further Reading: https://webviz.io/







