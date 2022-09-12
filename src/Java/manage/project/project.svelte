<script>
    import { beforeUpdate, onMount } from "svelte";
    import { writable } from "svelte/store";

    const storedToken = localStorage.getItem("tokenStorage");

    let resultList = [];
    let resultContent = [];

    export let division;
    let test = [];

    onMount(async() => {
        var test = document.location.href.split("/");
        let list = [];
        let result = fetch('http://localhost:8080/Manage/' + division,
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
            console.log(list);
            if (list.result == 'empty') {
                window.location.href="http://localhost:4000/Manage/login";    
            } else if (list.result == 'block') {
                window.location.href="http://localhost:4000/main";
            }
        });
    
        await result;
        console.log(result);
        resultList = list.list;
        resultContent = resultList[0].content;
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
                <a href="/Manage/project/{item.pk}">
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