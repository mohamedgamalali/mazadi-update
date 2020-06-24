
const setTimezoneOffset = function(date, offset) {
  
    date = new Date(date.getTime() + offset*60*1000);
    ['Minutes','Hours','Date','Month','FullYear'].forEach(function(value){
        date['get'+value] = date['getUTC'+value];
    });
    return date;
  
  }
  

exports.setTimezoneOffset = setTimezoneOffset;
