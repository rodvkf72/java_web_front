<script>
    import { quill } from "svelte-quill";
    import { beforeUpdate, onMount, tick } from "svelte";

    const options = {
        modules: {
            toolbar: [
                    [{'font': [] }, {'size': []}],
    				['bold', 'italic', 'underline', 'strike'],
    				[{'color': []}, {'background': []}],
    				[{ 'script': 'super' }, { 'script': 'sub' }],
	        		[{ 'header': [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'],
	        		[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
	        		['direction', { 'align': [] }], ['link', 'image', 'video'], ['clean']
                ]
        },
        placeholder: "Type something...",
        theme: "snow"
    }
    var quillInstance;

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
        console.log(list);
      });
  
      await result;
      resultList = list.list;
      resultNo = resultList[0].no;
      resultTitle = resultList[0].title;
      resultContent = resultList[0].content;
      document.getElementsByClassName("ql-editor")[0].innerHTML = resultContent;
      //document.getElementById("editor").innerHTML = resultContent;
    });
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
                  <span class="subheading">관리자 페이지 - main</span>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="area">
    <form id="form" enctype="multipart/form-data" method = "post" action = "action.do">
        <input type="hidden" id="no" value={resultNo}>     
        Title : <input type="text" id="title" value={resultTitle}>
        <br/><br/>
        <div id="editor" class="editor" use:quill={options} on:text-change={e => content = e.detail}>
            {resultContent}
        </div> 
    </form>
</div>
<br/><br/>
  