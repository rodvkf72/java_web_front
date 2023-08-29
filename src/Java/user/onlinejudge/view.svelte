<script>
  import { onMount } from "svelte";

  export let divi;
  export let no;

  $: items = fetch(`http://localhost:8080/onlinejudge/${divi}/${no}`,
    {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json",
      }
    }
  ).then(
    response => response.json()
  );
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
          {#await items}
            <p>로딩중...</p>
          {:then items}
            {#each items as item, index}
              <h2>{item.title}</h2>
              <br>
              <span class="meta">Posted by {item.writer} on {item.date}</span>
              <br>
            {/each}
          {:catch error}
          <p>{error}</p>
          {/await}
        </div>
      </div>
    </div>
  </div>
</header>

<!-- Post Content -->
<article>
  {#await items}
    <div class="loading-container" id="loading-bar">
      <div class="loading"></div>
      <div id="loading-text">loading</div>
    </div>
  {:then items}
    {#each items as item, index}

      <!-- 내용 탭 -->
      <div class="container">
        <div class="row">
          <div class="col-lg-8 col-md-10 mx-auto view">
            {@html item.content}
          </div>
        </div>
        <br>
        <hr>
      </div>

      <!-- 인기글 탭 -->
      <div class="container">
        <div class="row">
          <div class="col-lg-8 col-md-10 mx-auto">
            <div class="slider-container">
              <div class="slider">
                <div class="slides">
                  {#each item.popularList as popular, index}
                    {#if index < 1}
                      <div id="slides__{index+1}" class="slide">
                        <div onclick="location.href='http://localhost:4000/onlinejudge/{divi}/{popular.pk}'">
                          <br>
                          <div>{popular.division}</div>
                          <hr style="width:20%;">
                          <div>{popular.no}. {popular.title}</div>
                          <hr style="width:20%;">
                          <div>click : {popular.click}</div>
                        </div>
                        <a class="slide__prev" href="#slides__{popular.length}" title="Prev"></a>
                        <a class="slide__next" href="#slides__{index+2}" title="Next"></a>  
                      </div>
                    {:else if index > popular.length-2}
                      <div id="slides__{index+1}" class="slide">
                        <div onclick="location.href='http://localhost:4000/onlinejudge/{divi}/{popular.pk}'">
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
                        <div  onclick="location.href='http://localhost:4000/onlinejudge/{divi}/{popular.pk}'">
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
      </div>
      <hr>
    {/each}
  {:catch error}
    <p>{error}</p>
  {/await}
</article>