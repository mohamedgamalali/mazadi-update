document.querySelectorAll('.check').forEach(item => {
    item.addEventListener('click', event => {
        let dd = document.querySelectorAll('.check')
        let chechkedBool = false ;
        dd.forEach(i=>{
            if(i.checked==true){
                chechkedBool = true;
            }
        })
        if(chechkedBool == true){
            document.getElementById('deleteBut').classList.remove('hide');
        }else{
            document.getElementById('deleteBut').classList.add('hide');
        }
    })
})
  

