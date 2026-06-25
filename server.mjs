import express from "express";
import {ojs} from "ojs-loader"
const port = 3031;
const app = express();
const rooms = new Map(); //key=>[participant1,participant2]

//client side
const random = (len = 10)=>{
 if(len == 0)return '';
  let limit = 0,result = "";
  while(limit < len){
  result += Math.random().toString().split(".")[1][0];
  limit++;
  }
  return result;
}

app.get("/", (req, res) => {
    res.end(ojs.get("index.html"));
});

app.get("/room/:room_id", (req, res) => {
    const {room_id} = req.params;
     let user_id = random(2);
     res.redirect(`/room/${room_id}/user-${user_id}`);
     
});
app.get("/room/:room_id/:user_id", (req, res) => {
    const {room_id,user_id} = req.params;
    if(user_id == undefined){
        user_id = random(2);
    }

    res.end(ojs.get("room.html",{room_id,user_id}));
});


//server side
function partner_pubkey(room_id,user_id){
    let users = rooms.get(room_id);
    for(const user of users){
      if(user.user != user_id){
         return user.pub_key;
      }
    }
    return '';
}

function partner(room_id,user_id){
    let users = rooms.get(room_id);
    for(const user of users){
      if(user.user != user_id){
         return user;
      }
    }
    return false;
}
app.use(express.json());
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 next();
});

app.post("/end_handshake", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    //res.setHeader("Access-Control-Allow-Headers", "Chat-Name");
      let { room_id, user_id,aes_key } = req.body;
      let partnerClient = partner(room_id,user_id);
      partnerClient.client.write(`data: {"type":"end_handshake","data":"${aes_key}"}\n\n`);
       res.json({ status: 1 ,message:"handshake_completed."});
});

app.post("/pub_key", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    //res.setHeader("Access-Control-Allow-Headers", "Chat-Name");

    let { room_id, user_id,pub_key } = req.body;
    
    let users = rooms.get(room_id);
    //rooms.set(room_id, [{user,"client":res}]);
    let newRoom = [];
    for (const user of users) {
       if(user.user == user_id){
          user.pub_key = pub_key;
          newRoom.push(user);
       }else{
        newRoom.push(user);
       }
    }
    rooms.set(room_id,newRoom);
    users = rooms.get(room_id);
    
    let completedHandShake = true;
    for (const user of users) {
        if(user.pub_key == undefined){
            completedHandShake = false;
        }
    }
    if(users.length < 2){
         completedHandShake = false;
    }
    
    if(completedHandShake == true){
      let partnerClient = partner(room_id,user_id);
     partnerClient.client.write(`data: {"type":"status","data":"member_joined"}\n\n`);
    }
     let partnerKey = partner_pubkey(room_id,user_id);
    res.json({ status: 1 ,message:"broadcast successfully.",handshake:completedHandShake,pubkey:partnerKey});
 });

app.post("/post", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    //res.setHeader("Access-Control-Allow-Headers", "Chat-Name");

    let { room_id, user_id,message } = req.body;
    if (!rooms.has(room_id)) return res.end(`{"status":0,"message":"invalid room"}`);
    if (rooms.get(room_id).length < 2) return res.end(`{"status":0,"message":"no one live"}`);
    //console.log();
    
    let users = rooms.get(room_id);

    for (const user of users) {
        user.client.write(
            `data: {"type":"message","data":"${message}","user_id":"${user_id}"}\n\n`
        );
    }

    res.json({ status: 1 ,message:"broadcast successfully."});
});

app.get("/room-event/:room_id/:user", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
     res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let { room_id, user } = req.params;
   //  console.log(room_id," ",user);


    if (!rooms.has(room_id)) {
        rooms.set(room_id, [{user,"client":res}]);
    }
    let users = rooms.get(room_id);

    // console.log(users);
    //chat size logic
    if(users.length < 2 && !users.some(u => u.user === user)){
        /*{user,"client":res}*/
      
       let newUser = [...users, {user,"client":res}];
        rooms.set(room_id, newUser);
    }
   
   
    res.write(`data: {"type":"bot","data":"Initiating handshake..."}\n\n`);

    req.on("close",()=>{
    
    let users = rooms.get(room_id);
    //console.log(users);
    users = users.filter(
        u => u.user !== user
    );

    rooms.set(room_id, users);

    if (users.length === 0) {
        rooms.delete(room_id);
    } else {
        rooms.set(room_id, users);
        users[0].client.write(`data: {"type":"status","data":"member_left"}\n\n`);
        
    }
    //console.log(rooms);
    });
});



app.listen(port, () => console.log(`listening at http://localhost:${port}`));