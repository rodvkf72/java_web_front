<script>
    import { quill } from "svelte-quill";
    import { beforeUpdate, onMount, tick } from "svelte";

    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const id = sessionStorage.getItem("id");
    
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
              "Access" : accessToken,
              "Refresh" : refreshToken,
              "id" : id,
            },
          body: formData,
          }
        ).then((res) => {
          return res.json();
        }).then((json) => {
          var uuid = json.uuid;
          var fileName = json.fileName;
          //var path = json.path;
          var path = "http://rodvkf72.com:8081/file/"
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
        placeholder: "Content...",
        theme: "snow",
    }

    export let no;
    export let division;
    let resultList = [];
    let resultNo;
    let resultTitle;
    let resultContent;
    let content;
    let resultDivision = 'noticeboard';
    let resultTag;

    if (no == 'insert') {
      
    } else {
      onMount(async() => {
        let list = [];
        let result = fetch('http://localhost:8080/Manage/' + division + '/' + no,
          {
            method: 'POST',
            headers: {
              "Content-Type" : "application/json",
              "Access" : accessToken,
              "Refresh" : refreshToken,
              "id" : id,
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
          resultDivision = "noticeboard";
          resultTag = "";
        } else {
          resultNo = resultList[0].no;
          resultTitle = resultList[0].title;
          resultContent = resultList[0].content;
          resultDivision = resultList[0].division;
          resultTag = resultList[0].tag;
        }

        resultContent = resultContent.replace(/\<div/gi, '<p');
        resultContent = resultContent.replace(/\<\/div\>/gi, '</p>');
        document.querySelector(".ql-editor").innerHTML = resultContent;
      })
    }

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

      if (no == 'insert') {  //글을 새로 쓰는 경우
        obj = {
          "no" : document.getElementById("no").value,
          "title" : document.getElementById("title").value,
          "content" : document.getElementById("editor").children[0].innerHTML,
          "writer" : writer,
          "division" : document.getElementById("division").value,
          "tag" : document.getElementById("tag").value
        }

        let result = fetch('http://localhost:8080/Manage/' + division,
          {
            method: 'POST',
            headers: {
              "Content-Type" : "application/json",
              "Access" : accessToken,
              "Refresh" : refreshToken,
              "id" : id,
            },
            body: JSON.stringify(obj)
          }
        ).then((res) => {
          console.log(res);
          return res.json();
        }).then((json) => {
          if (json == "1") {
            alert("데이터 업데이트 완료.");
            window.location.href='/Manage/' + document.getElementById("division").value + '/s/1';
          } else {
            alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
          }
        });
      } else {  //글 업데이트의 경우
        obj = {
          "pk" : no,
          "no" : document.getElementById("no").value,
          "title" : document.getElementById("title").value,
          "content" : document.getElementById("editor").children[0].innerHTML,
          "writer" : writer,
          "division" : document.getElementById("division").value,
          "tag" : document.getElementById("tag").value
        }

        //let result = fetch('http://localhost:8080/Manage/'+ division + '/action/' + no,
        let result = fetch('http://localhost:8080/Manage/' + division,
        {
          //method: 'POST',
          method: 'PATCH',
          headers: {
            "Content-Type" : "application/json",
            "Access" : accessToken,
            "Refresh" : refreshToken,
            "id" : id,
          },
          body: JSON.stringify(obj)
        }
      ).then((res) => {
        console.log(res);
        return res.json();
      }).then((json) => {
        if (json == "1") {
          alert("데이터 업데이트 완료.");
          window.location.href='/Manage/' + division + '/s/1';
        } else {
          alert("데이터 업데이트 오류. 네트워크 상태 확인 및 관리자 문의");
        }
      });
      }
  }

  const deleteSubmit = () => {
    let obj = {
      "pk" : no,
      "no" : document.getElementById("no").value,
      "title" : document.getElementById("title").value,
      "content" : document.getElementById("editor").children[0].innerHTML,
      "writer" : writer,
      "division" : document.getElementById("division").value,
      "tag" : document.getElementById("tag").value
    }

    let result = fetch('http://localhost:8080/Manage/' + division,
      {
        method: 'DELETE',
        headers: {
          "Content-Type" : "application/json",
          "Access" : accessToken,
          "Refresh" : refreshToken,
          "id" : id,
        },
        body: JSON.stringify(obj)
      }
    ).then((res) => {
      return res.json();
    }).then((json) => {
      if (json == "1") {
        alert("데이터 삭제 완료.");
        window.location.href='/Manage/' + division + '/s/1';
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
    #editor {
        height:350px;
    }
    #no, #title, #tag{
      width: 100%;
    }
    #btn {
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
        <input type="text" id="no" placeholder="No" bind:value={resultNo}>
        <br><br>
        <input type="text" id="title" placeholder="Title" bind:value={resultTitle}>
        <br><br>
        {#if no == 'insert'}
          <textarea id="contentArea" style="display:none"></textarea>
        {:else}
          <textarea id="contentArea" style="display:none" bind:value={content}></textarea>
        {/if}
        <div id="editor" class="editor" use:quill={options} on:text-change={e => content = e.detail}>
            
        </div>
        <br>
        <input type="text" id="tag" placeholder="Hash Tag" bind:value={resultTag}>
        <br><br>
        분류 : 
          <select name="division" id="division" bind:value={resultDivision}>
            <option value="noticeboard">게시판</option>
            <option value="baekjoon">백준</option>
            <option value="programmers">프로그래머스</option>
          </select>
        <br/><br/>
        <div id="btn">
        {#if no == 'insert'}
          <input type="submit" name="action" value="저장">
          <input type="button" value="취소" onclick="history.back()">
        {:else}
          <input type="submit" name="action" value="수정">
          <input type="submit" name="action" value="삭제" on:click|preventDefault={deleteSubmit}>
        {/if}
        </div>
    </form>
</div>

  