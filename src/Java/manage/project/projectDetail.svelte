<script>
    import { quill } from "svelte-quill";
    import { beforeUpdate, onMount, tick } from "svelte";
import { element } from "svelte/internal";

    const storedToken = localStorage.getItem("tokenStorage");
    
    var imageHandler1 = () => {
      var input = document.createElement('input');
      
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      
      input.addEventListener('change', async() => {
        console.log("change");
        var file = input.files[0];
        var formData = new FormData();
        formData.append('img', file);

        let result = fetch('http://localhost:8080/Manage/fileUpload', {
          method: 'POST',
          headers: {
              "Authorization" : storedToken,
            },
          body: formData,
          }
        ).then((res) => {
          return res.json();
        }).then((json) => {
          var uuid = json.uuid;
          var fileName = json.fileName;
          //var path = json.path;
          var path = "http://localhost:8080/file/"
          var imgNode = document.createElement("img");
          imgNode.src = path + uuid + "_" + fileName;
          imgNode.style.cssText = "width: 100%; height: 100%;";

          var range = document.getSelection().getRangeAt(0);
          range.insertNode(imgNode);
        });
      });
    };

    const options = { 
        modules: {
          syntax: {
            highlight: text => window.hljs.highlightAuto(text).value
          },
          toolbar: {
            container:[[{'font': [] }, {'size': []}],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'color': []}, {'background': []}],
                  [{ 'script': 'super' }, { 'script': 'sub' }],
                    [{ 'header': [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                    ['direction', { 'align': [] }], ['link', 'image', 'video'], ['clean']],
            handlers:{
              image: imageHandler1,
            },
          },
        },
        placeholder: "Type something...",
        theme: "snow",
    }

    export let no;
    export let division;
    let content;
    let problemContent;
    let resultList = [];
    let resultTitle;
    let resultInfo;
    let resultPeople;
    let resultTechStack;
    let resultMyJob;
    let resultNotification;
    let resultReference;
    let resultCapture;
    let resultProblem;
    let resultDivision;
    let resultStartDate;
    let resultEndDate;

    if (no == 'insert') {
      console.log("tt");
    } else {
      onMount(async() => {
        let list = [];
        let result = fetch('http://localhost:8080/Manage/' + division + '/' + no,
          {
            method: 'POST',
            headers: {
              "Content-Type" : "application/json",
              "Authorization" : storedToken,
            }
          }
        ).then((res) => {
          return res.json();
        }).then((json) => {
          list = json;
        });

        await result;
        resultList = list.list;

        if (resultList.length <= 0) {
          resultTitle = "";
          resultInfo = "";
          resultPeople = "";
          resultTechStack = "";
          resultMyJob = "";
          resultNotification = "";
          resultReference = "";
          resultCapture = "";
          resultProblem = "";
          resultDivision = "";
          resultStartDate = "";
          resultEndDate = "";
        } else {
          resultTitle = resultList[0].title;
          resultInfo = resultList[0].info;
          resultPeople = resultList[0].people;
          resultTechStack = resultList[0].techStack;
          resultMyJob = resultList[0].myJob;
          resultNotification = resultList[0].notification;
          resultReference = resultList[0].notification;
          resultCapture = resultList[0].capture;
          resultProblem = resultList[0].problem;
          resultDivision = resultList[0].division;
          resultStartDate = resultList[0].startDate;
          resultEndDate = resultList[0].endDate;
        }

        resultMyJob = resultMyJob.replace(/\<div/gi, '<p');
        resultMyJob = resultMyJob.replace(/\<\/div\>/gi, '</p>');
        resultProblem = resultProblem.replace(/\<div/gi, '<p');
        resultProblem = resultProblem.replace(/\<\/div\>/gi, '</p>');
        const editors = document.querySelectorAll(".ql-editor");
        Array.from(editors).forEach((element, index) => {
            if (index == 0) {
                element.innerHTML = resultMyJob;
            } else if (index == 1) {
                element.innerHTML = resultProblem;
            }
        });
        //document.querySelector(".ql-editor").innerHTML = resultMyJob;
        //document.querySelector(".ql-editor")[1].innerHTML = resultProblem;
      })
    }

    let writer = "김광호";

    const handleSubmit = () => {
      document.getElementById("contentArea").value = document.getElementById("editor").children[0].innerHTML;
      document.getElementById("contentArea2").value = document.getElementById("editor2").children[0].innerHTML;

      var test = document.location.href.split("/");
      division = test[4];
      let list = [];
      let obj = {};

      if (no >= 0) {
        if (document.getElementById("title").value == "") {
          alert("제목이 공백입니다.");
          return false;
        }
      }

      if (no == 'insert') {  //글을 새로 쓰는 경우
        obj = {
          "title" : document.getElementById("title").value,
          "info" : document.getElementById("info").value,
          "people" : document.getElementById("people").value,
          "techStack" : document.getElementById("teck_stack").value,
          "myJob" : document.getElementById("my_job").children[0].innerHTML,
          "notification" : document.getElementById("notification").value,
          "reference" : document.getElementById("reference").value,
          "capture" : document.getElementById("capture").value,
          "problem" : document.getElementById("problem").children[0].innerHTML,
          "division" : document.getElementById("division").value,
          "startDate" : document.getElementById("start_date").value,
          "endDate" : document.getElementById("end_date").value
        }

        let result = fetch('http://localhost:8080/Manage/' + division,
          {
            method: 'POST',
            headers: {
              "Content-Type" : "application/json",
              "Authorization" : storedToken,
            },
            body: JSON.stringify(obj)
          }
        ).then((res) => {
          console.log(res);
          return res.json();
        }).then((json) => {
          if (json == "1") {
            alert("데이터 업데이트 완료.");
            window.location.href='/Manage/projects';
          } else {
            alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
          }
        });
      } else {  //글 업데이트의 경우
        obj = {
          "pk" : no,
          "title" : document.getElementById("title").value,
          "info" : document.getElementById("info").value,
          "people" : document.getElementById("people").value,
          "techStack" : document.getElementById("teck_stack").value,
          "myJob" : document.getElementById("my_job").children[0].innerHTML,
          "notification" : document.getElementById("notification").value,
          "reference" : document.getElementById("reference").value,
          "capture" : document.getElementById("capture").value,
          "problem" : document.getElementById("problem").value,
          "division" : document.getElementById("division").value,
          "startDate" : document.getElementById("start_date").value,
          "endDate" : document.getElementById("end_date").value
        }

        let result = fetch('http://localhost:8080/Manage/' + division,
        {
          method: 'PATCH',
          headers: {
            "Content-Type" : "application/json",
            "Authorization" : storedToken,
          },
          body: JSON.stringify(obj)
        }
      ).then((res) => {
        console.log(res);
        return res.json();
      }).then((json) => {
        if (json == "1") {
          alert("데이터 업데이트 완료.");
          window.location.href='/Manage/' + division + 's';
        } else {
          alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
        }
      });
      }
  }

  const deleteSubmit = () => {
    let obj = {
      "pk" : no
    }

    let result = fetch('http://localhost:8080/Manage/' + division,
      {
        method: 'DELETE',
        headers: {
          "Content-Type" : "application/json",
          "Authorization" : storedToken,
        },
        body: JSON.stringify(obj)
      }
    ).then((res) => {
      return res.json();
    }).then((json) => {
      if (json == "1") {
        alert("데이터 삭제 완료.");
        window.location.href='/Manage/projects';
      } else {
        alert("데이터 삭제 오류. 네트워크 상태 확인 및 관리자 문의");
      }
    })
  }
</script>

<style>
    .area {
        width: 80%;
        margin-left: 10%;
    }
    #editor, #editor2 {
        height: 350px;
    }
    #form, #title {
        text-align: center;
    }
</style>

<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-md-10 mx-auto">
                <div class="site-heading">
                  <h1>Kim's Log</h1>
                  <br>
                  <span class="subheading">관리자 페이지 - {division}</span>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="area">
    <form id="form" enctype="multipart/form-data" method="post" action = "http://localhost:18080/Manager/{division}/action/{no}" on:submit|preventDefault={handleSubmit}>
        Title : <input type="text" id="title" bind:value={resultTitle}> 
        <br><br>
        Division : 
          <select name="division" id="division" bind:value={resultDivision}>
            <option value="company">회사 프로젝트</option>
            <option value="personal">개인 프로젝트</option>
            <option value="school">학부 프로젝트</option>
          </select>
        <br/><br/>
        Info : <input type="text" id="info" bind:value={resultInfo}>
        <br/><br/>
        People : <input type="text" id="people" bind:value={resultPeople}>
        <br/><br/>
        TechStack : <input type="text" id="techStack" bind:value={resultTechStack}>
        <br/><br/>
        MyJob : 
        {#if no == 'insert'}
          <textarea id="contentArea" style="display:none"></textarea>
        {:else}
          <textarea id="contentArea" style="display:none" bind:value={content}></textarea>
        {/if}
        <div id="editor" class="editor" use:quill={options} on:text-change={e => content = e.detail}>
            
        </div>
        <br/><br/>
        Problem : 
        {#if no == 'insert'}
          <textarea id="contentArea2" style="display:none"></textarea>
        {:else}
          <textarea id="contentArea2" style="display:none" bind:value={problemContent}></textarea>
        {/if}
        <div id="editor2" class="editor" use:quill={options} on:text-change={e => problemContent = e.detail}>
            
        </div>
        <br/><br/>
        Notification : <input type="text" id="notification" bind:value={resultNotification}>
        <br/><br/>
        Reference : <input type="text" id="reference" bind:value={resultReference}>
        <br/><br/>
        Capture : <input type="text" id="capture" bind:value={resultCapture}>
        <br/><br/>
        StartDate : <input type="text" id="startDate" bind:value={resultStartDate}>&emsp; EndDate : <input type="text" id="endDate" bind:value={resultEndDate}>
        <br/><br/>
        
        {#if no == 'insert'}
          <input type="submit" name="action" value="저장">
          <input type="button" value="취소" onclick="history.back()">
        {:else}
          <input type="submit" name="action" value="수정">
          <input type="submit" name="action" value="삭제" on:click|preventDefault={deleteSubmit}>
        {/if}
    </form>
</div>

  