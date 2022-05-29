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

  let resultList = [];
  let resultContent;

  onMount(async() => {
    let list = [];
    let result = fetch('http://localhost:8080/b_judge/view/' + no,
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
    resultList = list.list;
    resultContent = resultList[0].content;
  })

  /*
  async function viewList() {
    let list = [];
    let result = fetch('http://localhost:8080/b_judge/view/' + no,
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
    resultList = list.list;
    resultContent = resultList[0].content;
  }

  viewList();
  */
</script>

<header class="masthead" style="background-image: url('/Java/image/post-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="post-heading">

            {#each resultList as item}
              <h1>{ item.title }</h1>
              <br>
              <span class="meta">Posted by { item.writer } on { item.date }</span>
            {/each}
              
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
        <div class="col-lg-8 col-md-10 mx-auto">
          {@html resultContent}
        </div>
      </div>
      <br>
      <hr>
    </div>
  </article>