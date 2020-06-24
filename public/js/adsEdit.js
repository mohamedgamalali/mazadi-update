
const editButton = (date)=>{

        var element = document.getElementById("editForm");
        element.classList.remove("hide");
        
        const l = JSON.parse(date.value);
        document.getElementById("desc").value =l.desc;
        document.getElementById("phone").value = l.phone;
        document.getElementById("id").value = l._id;  

  };
  