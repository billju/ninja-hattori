var linebot = require('linebot');
var express = require('express');
var fs = require('fs');

var report_status = {};
fs.readFile('report_status.json', function(err, data){
  if(err){return console.error(err);}
  report_status = JSON.parse(data.toString());
  console.log(JSON.stringify(report_status));
});

function clear_status(group_id){
  /*
  for(key in report_status[group_id]){
    report_status[group_id][key] = "";
  }*/
  delete report_status[group_id];
  fs.writeFile('report_status.json', report_status, function(err){
    if(err){return console.error(err);}
  }
)};

function multi_report(group_id, msg_txt){
  var msg_line = msg_txt.split('\n');
  var write_key = '';
  var last_write_key = '';
  var tmp_txt = '';

  for(var idx=0;idx<msg_line.length;idx++){
    //找每行文字開頭是否在名單內
    for(key in report_status[group_id]){
      if(key != null){
        var txt_head = msg_line[idx].substr(0, key.length);
        if(key == txt_head){
          write_key= key;
          break;
        }
      }
    }
    //如果有的話就進行五種判斷式
    if(write_key!=''){
      //只回報一個
      if(last_write_key=='' && (idx==msg_line.length-1)){
        report_status[group_id][write_key] = msg_line[idx]
      }
      //回報多個且為第一人
      else if(last_write_key==''){
        last_write_key = write_key;
      }
      //回報多個且最後一人輸入只有一行
      else if( (write_key != last_write_key) && (idx==msg_line.length-1) ){
        //test if last one character equals new line
        report_status[group_id][last_write_key] = tmp_txt;
        report_status[group_id][write_key] = msg_line[idx];
      }
      //回報多個且換下一個人
      else if(write_key != last_write_key){
        report_status[group_id][last_write_key] = tmp_txt;
        tmp_txt = '';
        last_write_key = write_key;
      }
      //回報多個且最後一人輸入不只一行
      else if(idx==msg_line.length-1){
        report_status[group_id][last_write_key] = tmp_txt+msg_line[idx];
      }
      //換人後輸入為空值
      tmp_txt +=  msg_line[idx]+'\n';
    }
  }
  //寫入json檔案
  fs.writeFile('report_status.json', report_status, function(err){
    if(err){return console.error(err);}
    console.log(JSON.stringify(report_status));
  });
};

var bot = linebot({
  channelId: '你的頻道ID',
  channelSecret: '你的祕密',
  channelAccessToken: '你的存取代碼'
});

bot.on('join', function (event) {
  var intro_txt = '在下乃忍者哈特利是也\n來幫各位彙整回報內容\n';
  intro_txt+= '1. 輸入重複輸入可以蓋掉前一個人的內容\n';
  intro_txt+= '2. 輸入「你逆」呼叫在下回報現況\n';
  intro_txt+= '3. 出問題時請用指令「重新回報」\n';
  intro_txt+= '4. 在下說「在下已完成彙整 你逆」就會清空資料\n';
  intro_txt+= '5. 彙整到一半的資料在下也能處理';
  if(typeof event.source.groupId!="undefined"){
      intro_txt += '\n順帶一提，群組ID:'+event.source.groupId;
  }
  event.reply(intro_txt);
});

bot.on('message', function(event) {
  if(event.message.type == 'text') {
    var msg_txt = event.message.text;
    var msg_id = event.message.id;
    var group_id = event.source.groupId;

    if(!isNaN( parseInt(msg_txt.substr(0,3)) )){
      console.log("有人在群組"+group_id+"回報");
      if(typeof report_status[group_id]!="object"){
        report_status[group_id] = {};
        //預設一班為16人
        var member_num = 16;
        var create_key_num = parseInt(msg_txt.substr(0,3))-1;
        var class_idx = Math.floor(create_key_num/member_num);
        var member_array = Array.from(Array(member_num).keys(), x=>x+1+class_idx*member_num);
        member_array.forEach(function(x){
          var num_to_str = (x<100)?"0"+x:""+x;
          report_status[group_id][num_to_str] = "";
        });
        console.log("資料建立完成"+JSON.stringify(report_status[group_id]));
      }
    }

    /**
    if(txt_head in report_status){
        report_status[txt_head] = msg_txt;
        fs.writeFile('report_status.json', report_status, function(err){
          if(err){return console.error(err);}
          console.log(JSON.stringify(report_status));
        }
      );}
      **/
    multi_report(group_id, msg_txt);

    //班長超愛在群組裡講打手槍
    if(msg_txt.includes('打手槍')){
      reply_candidate = ['你是不是偷看夢子洗澡打手槍啊','一精十血，多尻傷身是也','如此這般 如此這般'];
      event.reply(reply_candidate[Math.floor(Math.random()*reply_candidate.length)]);
    }

    switch(msg_txt){
      case '重新回報':
        clear_status(group_id);
        var meme_img_url = './meme_img.jpg';
        var meme_img = {
          type: 'image',
          originalContentUrl: meme_img_url,
          previewImageUrl: meme_img_url
        }
        event.reply([{ type: 'text', text: '真是的，一定又是煙捲搞的鬼' }, meme_img]);
        break;

      case '你逆':
        var report_txt = '';
        var not_yet_report = '';
        for(key in report_status[group_id]){
          if(key != null){  // Keys in object exist undefined
            var report_content = report_status[group_id][key];
            if(report_content != ''){
              report_txt += report_content + '\n';
            }
            else{
              not_yet_report += ' ' + key;
            }
          }
        }
        //filter all null lines in text
        report_txt = report_txt.split('\n');
        report_txt = report_txt.filter(word => word!='');
        report_txt = report_txt.join('\n');

        if(not_yet_report == ''){
          clear_status(group_id);
          event.reply([{type: 'text', text: report_txt},
            {type:'text', text: '在下已完成彙整 你逆'}]);
        }
        else{
          event.reply([{type: 'text', text: report_txt},
            {type:'text', text: '尚未回報'+not_yet_report}]);
        }
        break;
      default:
        break;
    }
  }
});

const app = express();
app.use('/images',express.static(__dirname+'/images'));
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});
