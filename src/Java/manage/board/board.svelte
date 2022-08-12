<script>
    import { onMount, tick } from "svelte";
    import { writable } from "svelte/store";

    const storedToken = localStorage.getItem("tokenStorage");

    let resultList = [];
    let prev;
    let next;
    let resultContent = [];

    export let division;
    export let page;
    let test = [];

    onMount(async() => {
        var test = document.location.href.split("/");
        console.log(test);
        division = test[4];
        let list = [];
        let result = fetch('http://localhost:8080/Manage/' + test[4] + '/' + page,
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
            }
        });
    
        await result;
        resultList = list.list;
        console.log(resultList);
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
                <a href="/Manage/{division}/update/{item.no}">
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

        <!--
        <c:forEach items="${ list }" var="item">
	       	<div class="post-preview">
	          <a href="/noticeboard/view/${ item.no }">
	            <p class="post-title" style="text-align: center">
	              ${ item.title }
	            </p>
	          </a>
	          <p class="post-meta" style="text-align: right">Posted by
	            <a href="#">${ item.writer }</a>
	            on ${ item.date }</p>
	        </div>
        	<hr>
		</c:forEach>
        -->
        <!-- Pager -->
      </div>
    </div>
  </div>