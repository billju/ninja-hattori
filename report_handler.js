const User = require('./model');

module.exports = function(report_status, group_id, msg_txt){
    var msg_line = msg_txt.split('\n');
    var write_key = '';
    var last_write_key = '';
    var tmp_txt = '';

    for(var idx=0;idx<msg_line.length;idx++){
      //找每行文字開頭是否在名單內
      for(var key in report_status[group_id]){
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
          report_update[write_key] = msg_line[idx]
        }
        //回報多個且為第一人
        else if(last_write_key==''){
          last_write_key = write_key;
        }
        //回報多個且最後一人輸入只有一行
        else if( (write_key != last_write_key) && (idx==msg_line.length-1) ){
          //test if last one character equals new line
          report_update[last_write_key] = tmp_txt;
          report_update[write_key] = msg_line[idx];
        }
        //回報多個且換下一個人
        else if(write_key != last_write_key){
          report_update[last_write_key] = tmp_txt;
          tmp_txt = '';
          last_write_key = write_key;
        }
        //回報多個且最後一人輸入不只一行
        else if(idx==msg_line.length-1){
          report_update[last_write_key] = tmp_txt+msg_line[idx];
        }
        //換人後輸入為空值
        tmp_txt +=  msg_line[idx]+'\n';
      }
    }

    return report_status
  };