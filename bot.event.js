var bot = require('./bot.config')
var User = require('./model');
 
var intro_txt = 
  '在下乃忍者哈特利是也\n來幫各位彙整回報內容\n'+
  '1. 輸入重複輸入可以蓋掉前一個人的內容\n'+
  '2. 輸入「你逆」呼叫在下回報現況\n'+
  '3. 指令「重新回報」清空所有回報內容\n'+
  '4. 指令「重新建立名單」清空成員名單\n'+
  '5. 指令「help」「助け」「哈特利」呼叫說明\n'+
  '6. 在下說「在下已完成彙整 你逆」就會清空資料\n'+
  '7. 請輸入「建立名單001到018」開始';

bot.on('join', function (event) {
  if(event.source.groupId){
    event.reply(intro_txt+"\n順帶一提，群組ID為"+event.source.groupId);
  }
});
  
bot.on('message', function(event) {
    if(event.message.type == 'text') {
      var msg_txt = event.message.text;
      var group_id = event.source.groupId;

      if(msg_txt.substr(0,4)=='建立名單'){
        try{
          var start_idx = msg_txt.substr(4).split('到')[0]*1;
          var end_idx = msg_txt.substr(4).split('到')[1]*1;
          var member_count = end_idx - start_idx + 1;
          member_arr = Array.from(Array(member_count).keys(),x=>x+start_idx);
          member_arr = member_arr.map(x=> ("00"+x).substr(-3));
          member_arr.forEach((member,idx)=>{
            var newUser = new User({
                group_id,
                member,
                content: '',
            });
            newUser.save().catch(err=>console.log(err));
          });
          event.reply('建立完成 '+member_arr.join(', '));
          console.log(`建立在群組 ${group_id} 成員${start_idx}到${end_idx}`);
        }catch{
          event.reply('來亂的喔');
        }
      }else{
        User.findOne({group_id: group_id}).then(user=>{
          if(!user){
            event.reply('本群組還沒建立名單，請輸入「建立名單xxx到xxx」開始')
          }
        });
      }

      // 更新回報內容
      // 有時候有人會多打空格' 019在家'，覺得頭痛
      var member = msg_txt.split(' ').filter(x=>x!='').join().substr(0,3);
      User.findOne({group_id: group_id, member: member}).exec().then(user=>{
          if(user){
            User.updateOne({group_id:group_id, member:member},{content:msg_txt})
            .exec()
            .then()
            .catch(err=>console.log(err));
          }else if(!isNaN(member.replace('0','')*1)){
            event.reply(`${member}不在群組內，別想騙我`);
          }
      });

      // 設定關鍵字彩蛋
      // 班長超愛在群組裡講打手槍
      if(msg_txt.includes('打手槍')){
        reply_candidate = ['你是不是偷看夢子洗澡打手槍啊','一精十血，多尻傷身是也','如此這般 如此這般'];
        event.reply(reply_candidate[Math.floor(Math.random()*reply_candidate.length)]);
      }
      // 設定指令
      switch(msg_txt){
        case '重新回報':
          User.updateMany({group_id: group_id},{content: ''})
            .exec()
            .then(console.log(`${group_id} 重新回報`))
            .catch(err=>console.log(err));
          var meme_img = {
            type: 'image',
            originalContentUrl: '/images/meme_img.jpg',
            previewImageUrl: '/images/meme_img.jpg',
          }
          event.reply({ type: 'text', text: '真是的，一定又是煙捲搞的鬼' });
          break;

        case '重新建立名單':
          User.deleteMany({group_id: group_id},{content: ''})
          .exec()
          .then(console.log(`${group_id} 重新建立名單`))
          .catch(err=>console.log(err));
          break;

        case 'help':
          event.reply(intro_txt);break;
        case '助け':
          event.reply(intro_txt);break;
        case '哈特利':
          event.reply(intro_txt);break;

        case '你逆':
          var report_txt = '';
          var not_yet_report = '';
          User.find({group_id:group_id}).sort('member').exec().then(users=>{
            users.forEach((user,idx)=>{
              if(user.content !='')
                report_txt += user.content + '\n';
              else
                not_yet_report += ' ' + user.member;
            });
            
            //filter all null lines in text
            report_txt = report_txt.split('\n');
            report_txt = report_txt.filter(word => word!='');
            report_txt = report_txt.join('\n');

            console.log('回報內容',report_txt);

            if(not_yet_report == ''){
              User.updateMany({ group_id: group_id}, {content:''}).exec().catch(err=>console.log(err));
              event.reply([{type: 'text', text: report_txt},
                {type:'text', text: '在下已完成彙整 你逆'}]);
            }
            else{
              if(report_txt == '') report_txt = '空空如也';
              event.reply([{type: 'text', text: report_txt},
                {type:'text', text: '尚未回報'+not_yet_report}]);
            }
          });
          break;
        default:
          break;
      }
    }
  });

const linebotParser = bot.parser();

module.exports = linebotParser
