<script>
    import { onMount } from "svelte";

    const storedToken = localStorage.getItem("tokenStorage");

    onMount(async() => {
        console.log(storedToken);
        if (storedToken == "" || storedToken == null) {
            window.location.href="http://localhost:4000/Manage/login";
        }
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
                  <span class="subheading">관리자 페이지 - main</span>
                </div>
            </div>
        </div>
    </div>
</header>