<script>
  import { onMount } from "svelte";

  export let no;

  $: items = fetch(`http://localhost:8080/board/${no}`,
    {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json",
      }
    }
  ).then((res) => {
    return res.json();
  }).then((result) => {
    return result;
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
          {#await items}
            <p>로딩중...</p>
          {:then items}
            <h2>{items.view.title}</h2>
            <br>
            <span class="meta">Posted by {items.view.writer} on {items.view.date}</span>
            <br>
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
    <!-- 내용 탭 -->
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto view">
          {@html items.view.content}
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
                {#each items.view.popularList as popular, index}
                  {#if index < 1}
                    <div id="slides__{index+1}" class="slide">
                      <div onclick="location.href='http://localhost:4000/board/{popular.pk}'">
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
                      <div onclick="location.href='http://localhost:4000/board/{popular.pk}'">
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
                      <div  onclick="location.href='http://localhost:4000/board/{popular.pk}'">
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
  {:catch error}
    <p>{error}</p>
  {/await}
</article>