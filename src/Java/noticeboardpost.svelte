<script>
import { onMount } from "svelte";


    export let page;
  
    let resultList = [];
    let prev;
    let next;
    let resultContent;

    function reload() {
        location.reload();
    }
    onMount(async() => {
      let list = [];
      let result = fetch('http://localhost:8080/noticeboard/view/' + page,
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
      resultContent = resultList[0].content;
      prev = list.temp[0].prevtitle;
      next = list.temp[0].nexttitle;
    })
</script>

{#each resultList as item}
<header class="masthead" style="background-image: url('img/post-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="post-heading">
            <h1>{ item.title }</h1>
            <br>
            <!-- <h2 class="subheading">Problems look mighty small from 150 miles up</h2> -->
            <span class="meta">Posted by { item.writer } on { item.date }</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Post Content -->
  <article>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
            {@html resultContent}
        </div>
      </div>
      <hr>
      <br>
    </div>
  </article>
  <div style="float: left; width: 30%; margin-left: 20%;">
    <span style="float: left">
      {#if next == -1}
            다음 글이 없습니다.
      {:else}
            <a href="http://localhost:4000/noticeboard/view/{next}">{item.nexttitle}</a>    
      {/if}
    </span>
  </div>
  <div style="display: inline-block; width: 30%; margin-right: 20%;">
      <span style="float: right">
          {#if prev == -2}
            이전 글이 없습니다.
          {:else}
            <a style="float: right;" href="http://localhost:4000/noticeboard/view/{prev}">{item.prevtitle}</a>
          {/if}
      </span>
  </div>
<br>
<br>
<hr>
<br>
{/each}