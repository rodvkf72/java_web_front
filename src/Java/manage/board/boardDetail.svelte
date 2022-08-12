<script>
    import { quill } from "svelte-quill";
    import { beforeUpdate, onMount, tick } from "svelte";

    
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

        let result = fetch('http://localhost:8080/Manager/fileUpload', {
          method: 'POST',
          body: formData,
          }
        ).then((res) => {
          return res.json();
        }).then((json) => {
          var uuid = json.uuid;
          var fileName = json.fileName;
          //var path = json.path;
          var path = "/upload/"
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
    let resultList = [];
    let resultNo;
    let resultTitle;
    let resultContent;
    let content;

    onMount(async() => {
      var test = document.location.href.split("/");
      division = test[4];
      let list = [];
      let result = fetch('http://localhost:8080/Manager/'+ division + '/update/' + no,
        {
          method: 'POST',
          headers: {
            "Content-Type" : "application/json",
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
        resultNo = 0;
        resultTitle = "";
        resultContent = "";
      } else {
        resultNo = resultList[0].no;
        resultTitle = resultList[0].title;
        resultContent = resultList[0].content;
      }
      //document.getElementsByClassName("ql-editor")[0].innerHTML = resultContent;
      console.log(resultContent);
      resultContent = resultContent.replace(/\<div/gi, '<p');
      resultContent = resultContent.replace(/\<\/div\>/gi, '</p>');
      document.querySelector(".ql-editor").innerHTML = resultContent;
      //document.getElementById("editor").innerHTML = resultContent;
    });

    let writer = "김광호";

    const handleSubmit = () => {
      document.getElementById("contentArea").value = document.getElementById("editor").children[0].innerHTML;

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

      if (resultNo == "0") {  //글을 새로 쓰는 경우
        obj = {
          "no" : "0",
          "title" : document.getElementById("title").value,
          "content" : document.getElementById("editor").children[0].innerHTML,
          "writer" : writer
        }
      } else {  //글 업데이트의 경우
        obj = {
          "no" : resultNo,
          "title" : resultTitle,
          "content" : document.getElementById("editor").children[0].innerHTML,
          "writer" : writer  
        }
      }

      let result = fetch('http://localhost:8080/Manage/'+ division + '/action/' + no,
        {
          method: 'POST',
          headers: {
            "Content-Type" : "application/json",
          },
          body: JSON.stringify(obj)
        }
      ).then((res) => {
        return res.json();
      }).then((json) => {
        list = json;

        if (list.result == "success") {
          alert("데이터 업데이트 완료.");
          window.location.href='/Manage/' + division + '/list/1';
        } else {
          alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
        }
      });
  }

  function change() {
    no = -no;
  }
</script>

<style>
    .area {
        width: 80%;
        height: 800px;
        margin-left: 10%;
    }
    #editor {
        height: 700px;
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
    <form id="form" enctype="multipart/form-data" method = "post" action = "http://localhost:18080/Manager/{division}/action/{no}" on:submit|preventDefault={handleSubmit}>
        <input type="hidden" id="no" bind:value={resultNo}>
        Title : 
        {#if no == 0}
          <input type="text" id="title" bind:value={resultTitle}>
        {:else}
          <input type="text" id="title" bind:value={resultTitle}>
        {/if}
        <br/><br/>
        {#if no == 0}
          <textarea id="contentArea" style="display:none"></textarea>
        {:else}
          <textarea id="contentArea" style="display:none" bind:value={content}></textarea>
        {/if}
        <div id="editor" class="editor" use:quill={options} on:text-change={e => content = e.detail}>
            
        </div>
        <br>
        {#if no == 0}
          <input type="submit" name="action" value="저장">
        {:else}
          <input type="submit" name="action" value="수정">
          <input type="submit" name="action" value="삭제" on:click={change}>
        {/if}
    </form>
</div>
<br/><br/><br/><br/>
  