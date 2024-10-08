let currentPage = 1;
let lastPage = 1;
getAllPosts();
function getAllPosts(page = 1) {
  toggleLoader(true);
  axios({
    method: "get",
    url: `${baseUrl}/posts?limit=5&page=${page}`,
    headers: {
      Accept: "application/json",
    },
    redirect: "follow",
  })
    .then((response) => {
      let posts = response.data.data;
      lastPage = response.data.meta.last_page;
      // lastPage = 3;
      let userId = JSON.parse(localStorage.getItem("user-data")) || "ok";
      posts.map(function (post) {
        let postBox = `
            <div  class="mb-5 pb-0" id="post">
                    <div class="card border border-1 shadow" style="width:55rem;">
                        <div class="card-header">
                            <button class="info pe-auto border-0 btn px-0"><img class="rounded-circle border border-4"
                                    src="${
                                      post.author.profile_image
                                    }" width="40px" height="40px"
                                    alt="profile image">${post.author.username}
                            </button>
                        </div>
                        <img onClick="zoomImg(this)" id="postImg" role="button" class="p-2 w-100 cursor-pointer" src="${
                          post.image
                        }"
                            alt="Post image">
                        <span class="position-absolute top-0 start-100 px-2 py-1 translate-middle badge rounded-pill bg-danger time">${
                          post.created_at
                        }
                        </span>
                        <div role="button" class="card-body cursor-pointer" onclick="sendPostData(${
                          post.id
                        })">
                            <h5 class="card-title">${post.title}</h5>
                            <p class="card-text">
                                ${post.body}
                            </p>
                        </div>
                        <div role="button" class="  cursor-pointer py-3 mb-0 px-2 card-header d-flex justify-content-between">
                            <button type="button" class="btn card-title pb-0 mb-0">
                                <i class="fa-regular fa-comment "></i>
                                <span>(${post.comments_count})</span>
                                Comments
                                <span id="postTags" class=" rounded-5 text-center px-2 text-light mx-2"> </span>
                            </button>                      
                            <div>
                              <i  onclick="updatePost('${encodeURIComponent(
                                JSON.stringify(post)
                              )}')"
 id="editPostBtn" data-bs-toggle="modal" data-bs-target="#update" class=" ${
   userId.id == post.author.id ? "" : "hidden"
 } fa-regular fa-edit mx-2  p-2 h4 cursor-pointer text-primary" role="button"></i>
 <i  onclick="deletePost('${encodeURIComponent(JSON.stringify(post.id))}')"
 id="deletePostBtn" class=" ${
   userId.id == post.author.id ? "" : "hidden"
 } fa-regular fa-trash-can mx-2 ms-auto p-2 h4 cursor-pointer  text-danger" role="button"></i>
                            </div>
                        </div>
                    </div>
                </div>
                `;
        document.getElementById("posts").innerHTML += postBox;
        toggleLoader(false);
      });
    })
    .catch((error) => console.log(error.message));
}

function Login() {
  const form = new FormData();
  form.append("username", document.getElementById("login-name").value);
  form.append(
    "password",
    document.getElementById("password-input-login").value
  );
  axios({
    method: "POST",
    url: `${baseUrl}/login`,
    headers: {
      Accept: "application/json",
    },
    data: form,
  })
    .then(function (response) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user-data", JSON.stringify(response.data.user));
      showSuccessMessage("Logged in successfully", "success");
      const loginModal = document.getElementById("Login");
      const modalInstance = bootstrap.Modal.getInstance(loginModal);
      modalInstance.hide();
      setUiAfterLogin();
      getAllPosts();
      window.location.reload();
    })
    .catch((error) => {
      myError = error.response.data.message;
      // error = error.response.data.message;
      document.getElementById("login-error-place").innerHTML = myError;
    });
}
function checkIfUserIsLoggedIn() {
  if (
    localStorage.getItem("token") == null ||
    localStorage.getItem("token") == undefined
  ) {
    return;
  } else {
    setUiAfterLogin();
  }
}
checkIfUserIsLoggedIn();

function showSuccessMessage(MyMessage, MyType) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  appendAlert(MyMessage, MyType);
  setTimeout(() => {
    const alert = bootstrap.Alert.getOrCreateInstance("#liveAlertPlaceholder");
    // alert.close();
  }, 2000);
}

function setUiAfterLogin() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("Register-form").style.display = "none";
  if (document.getElementById("toggleProfile") != null) {
    document.getElementById("toggleProfile").classList.remove("d-none");
  }
  const myList = document.getElementById("list");
  const userData = JSON.parse(localStorage.getItem("user-data"));
  const name = userData.name.split(" ")[0];
  myList.innerHTML += `
                    <li class="py-2 navImG">
                        <a class="vlink rounded" href="profile.html">
                          <img class=" rounded-circle border border-1 w-50" src="${
                            userData.profile_image
                          }" ></img>
                          <span>${name.toUpperCase()}</span>
                        </a>
                    </li>
                    <li>
                        <a id="logOut" onClick="logOut(event)" class="vlink rounded" href="#">
                          <i class="fa-solid fa-arrow-right-from-bracket"></i>
                          <span>Log out</span>
                        </a>
                    </li>
  `;
  document
    .getElementById("create-post")
    .style.setProperty("display", "block", "important");
}

function logOut(event) {
  const ask = confirm("Are you sure you want to log out?");
  if (!ask) {
    return;
  }
  event.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user-data");
  showSuccessMessage("Logged out successfully", "danger");
  setTimeout(() => {
    location.reload();
  }, 500);
}

function Registration() {
  const form = new FormData();
  form.append("username", document.getElementById("userNameRegister").value);
  form.append("password", document.getElementById("password-input").value);
  form.append("name", document.getElementById("name-register").value);
  form.append("email", document.getElementById("recipient-email").value);
  form.append("image", document.getElementById("image-input").files[0]);

  axios({
    method: "POST",
    url: `${baseUrl}/register`,
    headers: {
      Accept: "application/json",
    },
    data: form,
  })
    .then((data) => {
      data = data.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user-data", JSON.stringify(data.user));
      showSuccessMessage("Registered successfully", "success");
      const registerModal = document.getElementById("Register");
      const modalInstance = bootstrap.Modal.getInstance(registerModal);
      modalInstance.hide();
      setUiAfterLogin();
    })
    .catch((error) => {
      error = error.response.data;
      document.getElementById("Register-error-place").innerHTML = error.message;
    });
}

function createPost() {
  let postId = document.getElementById("post-id").value;
  let isCreate = postId == "" || postId == null;
  let form = new FormData();
  form.append("title", document.getElementById("postTitle").value);
  form.append("body", document.getElementById("postBody").value);
  form.append("image", document.getElementById("postImage").files[0]);

  if (isCreate) {
    axios({
      method: "post",
      url: `${baseUrl}/posts`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: form,
    })
      .then((response) => {
        showSuccessMessage("Post created successfully", "success");
        const createPostModal = document.getElementById("create-post-modal");
        const modalInstance = bootstrap.Modal.getInstance(createPostModal);
        modalInstance.hide();
        window.location.reload();
      })
      .catch((error) => {
        errors = error.response.data.message;
        document.getElementById("create-post-error-place").innerHTML = errors;
      });
  } else {
    form.append("_method", "PUT"),
      axios({
        method: "post",
        url: `${baseUrl}/posts/${postId}`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: form,
      })
        .then((response) => {
          showSuccessMessage("Post Updated successfully", "success");
          const createPostModal = document.getElementById("create-post-modal");
          const modalInstance = bootstrap.Modal.getInstance(createPostModal);
          modalInstance.hide();
          getAllPosts();
          window.location.reload();
        })
        .catch((error) => {
          errors = error.response.data.message;
          document.getElementById("create-post-error-place").innerHTML = errors;
        });
  }
}
const handleInfiniteScroll = () => {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
  if (endOfPage && currentPage < lastPage) {
    getAllPosts(currentPage + 1);
    currentPage++;
  }
};
window.addEventListener("scroll", handleInfiniteScroll);
function sendPostData(id) {
  this.addEventListener("click", () => {
    window.location.href = `postDetails.html?id=${id}`;
  });
}
function updatePost(post) {
  document.getElementById("submitBtn").innerHTML = "Update Post";
  document.getElementById("modal-title").innerHTML = "Edit Post";
  post = JSON.parse(decodeURIComponent(post));
  document.getElementById("post-id").value = post.id;
  document.getElementById("postTitle").value = post.title;
  document.getElementById("postBody").value = post.body;
  document.getElementById("postImage").files[0] = post.image;
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  postModal.toggle();
}
function AddPostBtn() {
  document.getElementById("submitBtn").innerHTML = "Create A New Post";
  document.getElementById("post-id").value = "";
  document.getElementById("modal-title").innerHTML = "Create A New Post";
  document.getElementById("postTitle").value = "";
  document.getElementById("postBody").value = "";
  document.getElementById("postImage").files[0] = "";
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  postModal.toggle();
}
function deletePost(id) {
  const ask = confirm("Are you sure you want to delete this post?");
  if (!ask) {
    return;
  }
  axios({
    method: "DELETE",
    url: `${baseUrl}/posts/${id}`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      showSuccessMessage("Post deleted successfully", "danger");
      window.location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
}

function toggleLoader(isshow = false) {
  if (isshow) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
function getUsersData() {
  toggleLoader(true);
  let userId = JSON.parse(localStorage.getItem("user-data")) || "ok";
  const idOfUser = userId.id;
  axios({
    method: "get",
    url: `${baseUrl}/users/${idOfUser}`,
    headers: {
      Accept: "application/json",
    },
    redirect: "follow",
  })
    .then((response) => {
      userId = response.data.data;
      document.getElementById("username").innerHTML = userId.username;
      document.getElementById("email").innerHTML = userId.email;
      document.getElementById("name").innerHTML = userId.name;
      document.getElementById("comments").innerHTML = userId.comments_count;
      document.getElementById("postsNum").innerHTML = userId.posts_count;
      document.getElementById("profileImg").src = userId.profile_image;
      document.getElementById("postsTitle").innerHTML =
        userId.name.toUpperCase() + " Posts";
      toggleLoader(false);
      getAllPostsForSingleUser(userId.id);
    })
    .catch((error) => {
      console.log(error);
    });
}
function getAllPostsForSingleUser(id) {
  toggleLoader(true);
  axios({
    method: "get",
    url: `${baseUrl}/users/${id}/posts`,
    headers: {
      Accept: "application/json",
    },
    redirect: "follow",
  })
    .then((response) => {
      let posts = response.data.data;
      // lastPage = response.data.meta.last_page;
      let userId = JSON.parse(localStorage.getItem("user-data")) || "ok";
      posts.map(function (post) {
        let postBox = `
            <div  class="mt-2 mb-5 pb-2" id="post">
                    <div class="card border border-1 shadow" style="width:55rem;">
                        <div class="card-header">
                            <button class=" pe-auto border-0 btn px-0"><img class="rounded-circle border border-4"
                                    src="${
                                      post.author.profile_image
                                    }" width="40px" height="40px"
                                    alt="profile image">${post.author.username}
                            </button>
                        </div>
                        <img onClick="zoomImg(this)" role="button" class="p-2 w-100 cursor-pointer " src="${
                          post.image
                        }"
                            alt="Post image">
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger time">${
                          post.created_at
                        }
                        </span>
                        <div role="button" class="card-body cursor-pointer" onclick="sendPostData(${
                          post.id
                        })">
                            <h5 class="card-title">${post.title}</h5>
                            <p class="card-text">
                                ${post.body}
                            </p>
                        </div>
                        <div role="button" class="card-header cursor-pointer py-3 mb-0 px-2 d-flex justify-content-between">
                            <button type="button" class="btn card-title pb-0 mb-0">
                                <i class="fa-regular fa-comment "></i>
                                <span>(${post.comments_count})</span>
                                Comments
                                <span id="postTags" class=" rounded-5 text-center px-2 text-light mx-2"> </span>
                            </button>                      
                            <div>
                              <i  onclick="updatePost('${encodeURIComponent(
                                JSON.stringify(post)
                              )}')"
 id="editPostBtn" data-bs-toggle="modal" data-bs-target="#update" class="fa-regular fa-edit mx-2  p-2 h4 cursor-pointer text-primary" role="button"></i>
 <i  onclick="deletePost('${encodeURIComponent(JSON.stringify(post.id))}')"
 id="deletePostBtn" class="fa-regular fa-trash-can mx-2 ms-auto p-2 h4 cursor-pointer text-primary" role="button"></i>
                            </div>
                        </div>
                    </div>
                </div>
                `;
        document.getElementById("profilePosts").innerHTML += postBox;
        toggleLoader(false);
      });
    })
    .catch((error) => console.log(error.message));
}
function toggleDarkMode(isDark = false) {
  if (localStorage.getItem("darkMode") === "true") {
    localStorage.removeItem("darkMode");
    document.getElementById("dark-mode-icon").classList.add("fa-sun");
    document.getElementById("dark-mode-icon").classList.remove("fa-moon");
    document.body.classList.add("dark-mode");
    document.getElementById("mainContainer").classList.add("dark-mode");
    const items = document.querySelectorAll(".card");
    items.forEach((item) => {
      item.classList.add("dark-mode");
    });
  } else {
    localStorage.setItem("darkMode", "true");
    document.getElementById("dark-mode-icon").classList.add("fa-moon");
    document.getElementById("dark-mode-icon").classList.remove("fa-sun");
    document.body.classList.remove("dark-mode");
    if (
      document.getElementById("mainContainer").classList.contains("dark-mode")
    ) {
      document.getElementById("mainContainer").classList.remove("dark-mode");
    }
    const items = document.querySelectorAll(".card");
    items.forEach((item) => {
      item.classList.remove("dark-mode");
    });
  }
}
// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Check if dark mode is enabled and store the setting
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
}

// Function to toggle minimal mode
function toggleMinimalMode() {
  const body = document.body;
  body.classList.toggle("minimal-mode");
  if (document.getElementById("mainContainer") != null) {
    document.getElementById("mainContainer").classList.toggle("minimal-mode");
  }
  if (body.classList.contains("minimal-mode")) {
    localStorage.setItem("minimalMode", "enabled");
  } else {
    localStorage.setItem("minimalMode", "disabled");
  }
}
function applyDarkModeSetting() {
  const darkModeSetting = localStorage.getItem('darkMode');
  if (darkModeSetting === 'enabled') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Function to apply the minimal mode setting on page load
function applyMinimalModeSetting() {
  const minimalModeSetting = localStorage.getItem('minimalMode');
  if (minimalModeSetting === 'enabled') {
    document.body.classList.add('minimal-mode');
  } else {
    document.body.classList.remove('minimal-mode');
  }
}

// Apply the settings on page load
document.addEventListener('DOMContentLoaded', (event) => {
  applyDarkModeSetting();
  applyMinimalModeSetting();

  // Add event listeners to the buttons
  const darkModeButton = document.getElementById('dark-mode');
  if (darkModeButton) {
    darkModeButton.addEventListener('click', toggleDarkMode);
  }

  const minimalModeButton = document.getElementById('minimal-mode');
  if (minimalModeButton) {
    minimalModeButton.addEventListener('click', toggleMinimalMode);
  }
});


function zoomImg(img) {
  let postModal = new bootstrap.Modal(document.getElementById("zoomImage"));
  postModal.toggle();
  console.log(img);
  console.log(document.getElementById("zoom-image"));
  document.getElementById("zoom-image").src = img.src;
}