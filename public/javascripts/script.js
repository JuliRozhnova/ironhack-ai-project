window.onload = () => {
  document
    .querySelector("a[href='/photo']")
    .setAttribute(
      "aria-hidden",
      document.location.pathname === "/photo" ? true : false
    );
};
