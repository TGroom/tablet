
var app = new Vue({
  el: '#app',
  data: {
    connected: false,
    ros: null,
    ws_address: localStorage.getItem("wsAddress"),
    loading: false,

    questionType: null,
    questionServer: null,
    optionsList: [],
    expanded: true,
  },

  methods: {
    connect: function() {
      this.loading = true;
      localStorage.setItem("wsAddress", this.ws_address);
      try {
        if (this.ws_address == "") {throw "";}
          this.ros = new ROSLIB.Ros({
              url: this.ws_address,
          })
      } catch {
        alert("'" + this.ws_address + "' is an invalid webSocket Address");
        this.connected = false;
        this.loading = false;
      }
      this.ros.on('connection', () => {
        this.connected = true;
        this.loading = false;
        this.actionlib();
      })
      this.ros.on('error', (error) => {
        alert("Failed to connect to '" + this.ws_address
          + "'\nPlease refer to the Troubleshooting section in the README.md for this ROS package");
      })
      this.ros.on('close', () => {
        this.connected = false;
        this.loading = false;
      })
    },


    disconnect: function() {
      this.ros.close();
    },


    expand: function(){
      this.expanded = !this.expanded;
    },


    response: function(answer){
      if (answer == "yes") {
        document.getElementById("gradGreen").style.opacity = 1;
        document.getElementById("gradRed").style.opacity = 0.3;
        document.getElementById("gradRed").disabled = true;
        document.getElementById("gradGreen").disabled = true;
      } else if (answer == "no") {
        document.getElementById("gradRed").style.opacity = 1;
        document.getElementById("gradGreen").style.opacity = 0.3;
        document.getElementById("gradRed").disabled = true;
        document.getElementById("gradGreen").disabled = true;
      } else if (answer == "options"){
        var radios = document.getElementsByName('radio');
        for(var i = 0; i < radios.length; i++){
          if (radios[i].checked) {
            answer = this.optionsList[i];
            break;
          }
        }
      } else if (answer == "text") {
        answer = document.getElementById("response").value;
      } else {
        answer = null;
      }

      var that = this;
      setTimeout(function() {
        that.questionType = null;
        document.getElementById("question").innerHTML = "<br><i class='material-icons' style='font-size:70px'>check</i><br>Response Submitted";
      }, 300)
      
      var result = { answer: String(answer)};  //send result
      this.questionServer.setSucceeded(result);
      console.log(result);
    },


    actionlib: function(){
      this.questionServer = new ROSLIB.SimpleActionServer({
        ros : this.ros,
        serverName : '/tabletActionLib',
        actionName : 'tablet/QuestionAction'
      });

      console.log("Waiting for goal ...");
      document.getElementById("question").innerHTML = "Awaiting Question";
      var that = this;

      this.questionServer.on('goal', function(goalMessage) {
        document.getElementById("question").innerHTML = goalMessage.question_text;
        console.log("Question Received");
        console.log(goalMessage);

        if (goalMessage.yes_no == true) {
          that.questionType = "yes/no";
        } else if (goalMessage.options == true) {
          that.questionType = "options";
          that.optionsList = goalMessage.list_of_options;
        } else if (goalMessage.text == true) {
          that.questionType = "text";
        }
      });

      this.questionServer.on('cancel', function(goalMessage){
        that.questionServer.setPreempted();
        console.log("Goal Cancelled");
        document.getElementById("question").innerHTML = "Question Cancelled";
        that.questionType = null;
        that.disconnect();
        that.connect();
      });
    },

  },
  mounted() {
  },

})
