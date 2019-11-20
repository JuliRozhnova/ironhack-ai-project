window.onload = () => {
  if (document.location.pathname === "/photo") {
    document
      .querySelector("a[href='/photo']")
      .setAttribute(
        "aria-hidden",
        document.location.pathname === "/photo" ? true : false
      );
  }
};
