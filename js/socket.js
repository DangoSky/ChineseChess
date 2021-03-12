var socket = null;
var clientInfo = null;
var remoteUrl = window.location.href.includes('dangosky.com') ? 'ws://dangosky.com:2222' : 'ws://localhost:2222';

function establishWS() {
  socket = io(remoteUrl);
  socket.on('connect', function() {
    console.log('成功连接服务器');
    socket && socket.emit('enterRoom', room);
  })

  socket.on('disconnect', function(a) {
    console.log('和服务器断开连接了');
    clientInfo = null;
    socket = null;
  })

  // 获取当前客户端和服务器的通信id
  socket.on('clientInfo', function(obj) {
    // 本客户端未连接服务器，提示本机的执棋信息，分为下棋者和观棋者
    if (clientInfo === null) {
      clientInfo = obj.clientInfo;
      if (clientInfo.group === 0) {
        showDialog('你执红棋先手，等待对方上线即可开始游戏');
      } else if(clientInfo.group === 1) {
        showDialog('你执黑棋后手，红棋已在线，等待对方落子');
      } else {
        showDialog(`成功进入${room}号房`);
      }
    } else if (obj.clientInfo) {
      if (obj.roomId !== room) {
        return;
      }
      // 使新上线的客户端能够获取到当前的棋盘信息
      if (clientInfo.group !== 2) {
        callServer();
      }
      if (obj.clientInfo.group === 1) {
        showDialog('黑棋已上线');
      } else if (obj.clientInfo.group === 0) {
        showDialog('红棋已上线');
      }
    }
    $('#peopleCount').text(obj.roomClientCount);
  })

  // 服务器有更新，接受新的棋盘信息
  socket.on('serverChange', function(data) {
    if (data.roomId === room) {
      mark = JSON.parse(data.mark);
      moves.push(data.move)
      turn = data.turn;
      isOver = data.isOver;
      if (data.clickNewGame === 0) {
        showDialog('红棋选择了重新开始游戏');
      } else if (data.clickNewGame === 1) {
        showDialog('黑棋选择了重新开始游戏');
      }
      changeChess();
    }
  });

  // 若下棋的两个人其中一方下线了，则出现弹框通知
  socket.on('dropNotice', function(data) {
    const { group, roomId } = data;
    if (roomId === room) {
      if (group === 0) {
        showDialog('红棋已下线');
      } else if(group === 1) {
        showDialog('黑棋已下线');
      }
    }
  })

  socket.on('clientReciveChatMessage', function(data) {
    const {room: roomId, message} = JSON.parse(data);
    if (roomId === room) {
      showChatMessage(message);
    }
  })
}

// 判断客户端和服务器是否有连接
function judgeConnecting() {
  return socket !== null;
}

// 移动棋子后通知服务器
function callServer() {
  if (judgeConnecting()) {
    socket.emit('clientChange', {
      roomId: room,
      mark: JSON.stringify(mark),
      move,
      isOver,
      turn,
      clickNewGame,
    });
  }
}

function closeWs(e) {
  if (judgeConnecting()) {
    socket.close();
  }
}

function sentChatMessage(value) {
  const identity = (clientInfo.group === 0 ? '红棋' : (clientInfo.group === 1 ? '黑棋' : '观众'));
  socket.emit('clientSendChatMessage', JSON.stringify({
    room,
    message: {
      identity,
      text: value,
      date: getTime()
    }
  }));
}
