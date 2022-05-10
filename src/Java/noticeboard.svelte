<script>
  import { onMount } from "svelte";
    export let page;
  
    let resultList = [];
    let max;
    let cnt = 1;

    onMount(async() => {
      let list = [];
      let result = fetch('http://localhost:8080/noticeboard/' + page,
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
      max = list.max[0].page;
    })
  
    /*
    async function noticeList() {
      let list = [];
      let result = fetch('http://localhost:8080/noticeboard/' + page,
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
      max = list.max[0].page;
    }
  
    noticeList();
    */
  </script>

<header class="masthead" style="background-image: url('/resources/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h1>게 시 판</h1>
            <br>
            <span class="subheading">잡동사니 저장소</span>
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
                <a href="/noticeboard/view/{item.no}">
                    <p class="post-title" style="text-align: center">
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

        <div class="clearfix">
          <div id="b_dv" style="text-align: center">
            {#if cnt <= max}
                <input type="button" value="{cnt}" onclick="location.href='/noticeboard/{cnt}'">&nbsp;
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>