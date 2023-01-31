<script>
    import {onMount} from 'svelte';
    import { tokenCheck } from "../../../../public/Java/js/blog/token-check";

    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const id = sessionStorage.getItem("id");

    onMount(async() => {
        if (!tokenCheck.hasToken()) {
            window.location.href="http://127.0.0.1:4000/Manage/login";
        }

        var test = document.location.href.split("/");
        let list = [];
        let result = fetch('http://127.0.0.1:8080/Manage/JwtCheck',
            {
                method: 'POST',
                headers: {
                    "Content-Type" : "application/json",
                    "Access" : accessToken,
                    "Refresh" : refreshToken,
                    "id" : id,
                }
            }
        ).then((res) => {
            console.log(res);
            return res;
        });
    })
</script>