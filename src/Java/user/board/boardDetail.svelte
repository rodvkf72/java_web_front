<!--
<script src="https://utteranc.es/client.js"
          repo="rodvkf72/Utterances"
          issue-term="url"
          theme="github-light"
          crossorigin="anonymous"
          async>
</script>
          -->

<script>
  import { onMount } from "svelte";

  export let no;
  export let divi;

  let resultList = [];
  let popularList = [];
  let popularSize = 0;
  let popularSizeMinus = 0;
  let onclick = "";

  onMount(async() => {
    let list = [];
    let result = fetch('http://localhost:8080/board/' + divi + '/' + no,
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
    resultList = list.list[0];
    popularList = list.popularList;
    popularSize = popularList.length;
    popularSizeMinus = popularSize - 2;
  })
</script>

<style>
  :global(.item:nth-child(n)) {
	  background-color: rgb(152, 255, 121);
  }
</style>

<header class="masthead" style="background-image: url('/Java/image/post-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="post-heading">
            
            <h2>{ resultList.title }</h2>
            <br>
            <span class="meta">Posted by { resultList.writer } on { resultList.date }</span>
              
            <!--<h1>${ item.title }</h1>-->
            <br>
            <!-- <h2 class="subheading">Problems look mighty small from 150 miles up</h2> -->
            <!--<span class="meta">Posted by ${ item.writer } on ${ item.date }</span>-->
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Post Content -->
  <article>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto view">
          {@html resultList.content}
        </div>
      </div>
      <br>
      <hr>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="slider-container">
            <div class="slider">
              <div class="slides">
                {#each popularList as popular, index}
                  {#if index < 1}
                    <div id="slides__{index+1}" class="slide">
                      <div onclick="location.href='http://localhost:4000/board/{popular.division}/view/{popular.pk}'">
                        <br>
                        <div>{popular.division}</div>
                        <hr style="width:20%;">
                        <div>{popular.no}. {popular.title}</div>
                        <hr style="width:20%;">
                        <div>click : {popular.click}</div>
                      </div>
                      <a class="slide__prev" href="#slides__{popularSize}" title="Prev"></a>
                      <a class="slide__next" href="#slides__{index+2}" title="Next"></a>  
                    </div>
                  {:else if index > popularSizeMinus}
                    <div id="slides__{index+1}" class="slide">
                      <div onclick="location.href='http://localhost:4000/board/{popular.division}/view/{popular.pk}'">
                        <br>
                        <div>{popular.division}</div>
                        <hr style="width:20%;">
                        <div>{popular.no}. {popular.title}</div>
                        <hr style="width:20%;">
                        <div>click : {popular.click}</div>
                      </div>
                      <a class="slide__prev" href="#slides__{index}" title="Prev"></a>
                      <a class="slide__next" href="#slides__1" title="Next"></a>  
                    </div>
                  {:else}
                    <div id="slides__{index+1}" class="slide">
                      <div  onclick="location.href='http://localhost:4000/board/{popular.division}/view/{popular.pk}'">
                        <br>
                        <div>{popular.division}</div>
                        <hr style="width:20%;">
                        <div>{popular.title}</div>
                        <hr style="width:20%;">
                        <div>click : {popular.click}</div>
                      </div>
                      <a class="slide__prev" href="#slides__{index}" title="Prev"></a>
                      <a class="slide__next" href="#slides__{index+2}" title="Next"></a>  
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
      </div>
    </div>
    <hr>
  </article>