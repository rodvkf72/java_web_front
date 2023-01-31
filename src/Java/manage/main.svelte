<script>
    import { onMount } from "svelte";
    import { tokenCheck } from "../../../public/Java/js/blog/token-check";

    let result =  tokenCheck.hasToken();
    async function load() {
        await result;
        if (!await result) {
            console.log("tt");
            window.location.href="http://127.0.0.1:4000/Manage/login";
        }
    }
    load();
</script>

{#await load}
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
{/await}