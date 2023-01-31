<script>
    import { beforeUpdate, onMount } from "svelte";
    import { writable } from "svelte/store";
    import { tokenCheck } from "../../../../public/Java/js/blog/token-check";

    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const id = sessionStorage.getItem("id");

    let resultList = [];
    let resultContent = [];

    export let division;
    let test = [];

    onMount(async() => {
        /*
        if (!tokenCheck.hasToken()) {
            window.location.href="http://127.0.0.1:4000/Manage/login";
        }
        */
       
        var test = document.location.href.split("/");
        let list = [];
        let result = fetch('http://127.0.0.1:8080/Manage/' + division,
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
            console.log(list);
            if (list.result == 'empty') {
                window.location.href="http://127.0.0.1:4000/Manage/login";    
            } else if (list.result == 'block') {
                window.location.href="http://127.0.0.1:4000/main";
            }
        });
    
        await result;
        console.log(result);
        resultList = list.list;
        console.log(resultList);
        resultContent = resultList[0].content;
        division = division.substr(0, division.length-1);
    })
</script>

<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-md-10 mx-auto">
                <div class="site-heading">
                  <h1>Kim's Log</h1>
                  <br>
                  <span class="subheading">관리자 페이지 - {division} </span>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- Main Content -->
<div class="container">
    <div class="row">
      <div class="col-lg-8 col-md-10 mx-auto">
          {#each resultList as item}
            <div class="post-preview">
                <a href="/Manage/{division}/{item.pk}">
                    <p class="post-title" style="text-align: center; font-size: 30px;">
                        {item.title}
                    </p>
                </a>
                <p class="post-meta" style="text-align: right">Posted by 
                    <a href="#">{item.writer}</a>
                    on {item.date}
                </p>
            </div>
            <hr>
          {/each}
      </div>
    </div>
    <a href="http://localhost:4000/Manage/board/insert">등록</a>
  </div>