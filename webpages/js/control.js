
var app = new Vue({
  el: '#app',
  data: {
    connected: false,
    ros: null,
    ws_address: localStorage.getItem("wsAddress"),
    loading: false,

    pubTopic: null,
    subTopic: null,
    subscribed: false,
    videoActive: false,
    videoListener: null,
    listener: null,
    topicType: null,
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
        alert(this.ws_address + " is an invalid webSocket Address");
        this.connected = false;
        this.loading = false;
      }
      this.ros.on('connection', () => {
        this.connected = true;
        this.loading = false;
        this.getTopics();
        this.sub2rosout();
      })
      this.ros.on('error', (error) => {
        alert("Failed to connect to '" + this.ws_address
          + "'\nPlease refer to the Troubleshooting section in the README.md for this ROS package");
      })
      this.ros.on('close', () => {
        this.connected = false;
        this.loading = false;
        if (this.subscribed == true) {
          this.sub2Topic();
        }
      })
    },


    disconnect: function() {
      this.ros.close();
    },


    selectEvent: function(){
      document.getElementById("data2pub").innerHTML = dict2[this.topicType];
      console.log(document.getElementById("data2pub").innerHTML);
    },


    roslibTopic: function(selected){
        return new ROSLIB.Topic({
            ros : this.ros,
            name : selected.options[selected.selectedIndex].text,
            messageType : selected.options[selected.selectedIndex].value
          });
    },


    pub2Topic: function(data){
      this.pubTopic = this.roslibTopic(document.getElementById("pubList"));
      console.log(data);
      this.pubTopic.publish(data);
    },


    sub2Topic: function(){
      if (this.subscribed == false) {
        this.subTopic = this.roslibTopic(document.getElementById("subList"));
        this.subscribed = true;
        var messageData = '';

        this.subTopic.subscribe(function(message) {
          messageData = JSON.stringify(message);
          var len = 20000;
          if (messageData.length > len) {
            messageData = messageData.substring(0, len-4) + " ...";
        }
          document.getElementById("topicData").innerHTML = messageData;
        })

        } else {
          try {
            this.subTopic.unsubscribe();
            this.subscribed = false;
          } catch(err) {
          }
        }
    },


    sub2rosout: function(){
      this.listener = new ROSLIB.Topic({ros : this.ros, name : "rosout", messageType : "rosgraph_msgs/Log"});
      var messageData = '';

      this.listener.subscribe(function(message) {
        messageData = JSON.stringify(message.msg);

        var dict = {1:"#ffffff'> [DEBUG] ", 
                    2:"#ffffff'> [INFO] ",
                    4:"#ffdd00'> [WARN] ",
                    8:"#ff9900'> [ERROR] ",
                    16:"#ff0000'> [FATAL] "};

        var msg = "<span style='color:" 
                + dict[message.level] 
                + JSON.stringify(message.header.stamp)
                + " > "
                + messageData
                + "</span> <br> "
                + document.getElementById("rosoutData").innerHTML;

        var len = 3000;
        if (msg.length > len) {
          msg = msg.substring(0,len-4) + " ...";
        }
        document.getElementById("rosoutData").innerHTML = msg;
      })
    },


    unsub2rosout: function(){
      this.listener.unsubscribe();
    },


    sub2Video: function(){
      if (this.videoActive == false) {
        this.videoListener = this.roslibTopic(document.getElementById("cameraList"));
        this.videoActive = true;
        this.videoListener.subscribe(function(message) {
          document.getElementById("frame").src = 'data:image/png;base64, ' + message.data;
        })
      } else {
        try {
          this.videoListener.unsubscribe();
          this.videoActive = false;
        } catch(err) {
        }
      }
    },


    getTopics: function() {
      var topicsClient = new ROSLIB.Service({
        ros : this.ros,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
      });

      var request = new ROSLIB.ServiceRequest();
      topicsClient.callService(request, function(result) {
        var i = 0;
        var test = result.topics;       // Sorting
        indexTest = test.map(function(e,i){return {ind: i, val: e}});
        indexTest.sort(function(x, y){return x.val > y.val ? 1 : x.val == y.val ? 0 : -1});
        sorted_index = indexTest.map(function(e){return e.ind});

        var resultTop = [];
        var resultTyp = [];
        for(var i = 0; i < sorted_index.length; i++) {         
          resultTop.push(result.topics[sorted_index[i]]);
          resultTyp.push(result.types[sorted_index[i]]);
        }
        var j = 0;

        for(var i = 0; i < result.topics.length; i++) {
          document.getElementById('subList').options[i] = new Option(resultTop[i], resultTyp[i]);
          document.getElementById('pubList').options[i] = new Option(resultTop[i], resultTyp[i]);
          if (resultTyp[i] == "sensor_msgs/CompressedImage") {
            document.getElementById('cameraList').options[j] = new Option(resultTop[i], resultTyp[i]);
            j++;
          }
        }
      });
    },

  },
  mounted() {
  },

})
