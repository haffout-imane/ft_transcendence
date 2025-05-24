import { initRouter } from "./utils/router.js";
import { connectWebSocket } from "./utils/socket.js";
import { handleChatMessage } from "./utils/socket.js";
  

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  
  // websocket connection
  connectWebSocket();


  // const testMessage = {
  //   type: "chat",
  //   payload: {
  //     from: "Alice",
  //     text: "Hello, how are you?",
  //     timestamp: new Date().toISOString(),
  //   },
  // };
  // handleChatMessage(testMessage.payload);


  

});
