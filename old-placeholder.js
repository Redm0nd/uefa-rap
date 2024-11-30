"use strict";
var clipTemplateTag = document.querySelector(".clip-template")
  , galleryContainer = document.querySelector(".gallery__container")
  , modalTemplateTag = document.querySelector(".modal-template")
  , modalContainer = document.querySelector(".modal-container")
  , accordionBtns = document.querySelectorAll(".menu__item--expandable")
  , accordionInfos = document.querySelectorAll(".accordion__info")
  , burgerNav = document.querySelector(".nav__burger-nav")
  , burgerBtn = document.querySelector(".burger-btn")
  , firstBar = document.querySelector(".burger-btn__bar--one")
  , secondBar = document.querySelector(".burger-btn__bar--two")
  , thirdBar = document.querySelector(".burger-btn__bar--three")
  , loaderBox = document.querySelector(".loader-box")
  , pageTitle = document.querySelector(".page-title")
  , body = document.body
  , URL = "../app-clips.json"
  , handleNav = function() {
    var e = document.querySelector(".nav__burger-nav");
    accordionInfos.forEach(function(e) {
        e.classList.remove("active"),
        e.previousElementSibling.querySelector("svg").classList.remove("rotate")
    }),
    e.classList.toggle("active-menu"),
    document.body.classList.toggle("body-lock"),
    firstBar.classList.toggle("first-cross"),
    thirdBar.classList.toggle("third-cross"),
    secondBar.classList.toggle("second-cross")
}
  , closeNavOutsideBox = function(e) {
    e.stopPropagation(),
    e.target.classList.contains("active-menu") && (burgerNav.classList.remove("active-menu"),
    document.body.classList.remove("body-lock"),
    firstBar.classList.remove("first-cross"),
    thirdBar.classList.remove("third-cross"),
    secondBar.classList.remove("second-cross"))
};
function openAccordionItems() {
    this.nextElementSibling.classList.toggle("active"),
    this.querySelector("svg").classList.toggle("rotate")
}
axios.get(URL).then(function(e) {
    function t(e) {
        modalContainer.classList.remove("hidden"),
        modalContainer.classList.add("modal-active"),
        modalContainer.dataset.active = !0,
        body.classList.add("body-lock");
        var t, a, o, n, r = modalTemplateTag.content.cloneNode(!0), i = r.querySelector(".close"), c = r.querySelector(".decision"), s = r.querySelector(".help-svg"), l = r.querySelector(".dictionary"), d = r.querySelector(".clip-title"), u = r.querySelector(".iframe"), m = r.querySelector(".decision-box"), y = r.querySelector(".decision-img"), p = r.querySelector(".next-btn"), b = r.querySelector(".previous-btn"), g = r.querySelector(".modal__box"), v = r.querySelector(".decision-translation"), S = r.querySelector(".additional-img");
        for (t in B || (s.style.display = "none"),
        B) {
            var L = document.createElement("p");
            L.innerHTML = "<span>".concat(t, "</span> - ").concat(B[t]),
            l.append(L)
        }
        function q(e) {
            for (modalContainer.classList.add("hidden"),
            modalContainer.classList.remove("modal-active"),
            modalContainer.dataset.active = !1,
            body.classList.remove("body-lock"); e.firstChild; )
                e.removeChild(e.firstChild)
        }
        function f(e, t, a, o, n, r) {
            o.textContent = n,
            g.dataset.index = r,
            e.setAttribute("src", a.video),
            t.setAttribute("src", a.decision),
            t.setAttribute("alt", "Decyzja klipu ".concat(n)),
            A.hasOwnProperty("translation") && (o = a.translation,
            v.textContent = o)
        }
        function x(e, t) {
            var a, o;
            e.hasOwnProperty("additional-explanation") && !A.hasOwnProperty("translation") ? e.hasOwnProperty("additional-explanation") && (a = e.explanation,
            o = e.translation,
            S.setAttribute("src", a),
            S.setAttribute("alt", "WyjaÅ›nienie klipu ".concat(t)),
            v.style.display = "block",
            v.textContent = o) : e.hasOwnProperty("additional-explanation") || A.hasOwnProperty("translation") || (S.setAttribute("src", ""),
            S.setAttribute("alt", ""),
            v.textContent = "",
            v.style.display = "none")
        }
        function h(e) {
            var t = (e = e.target.closest(".modal__box")).querySelector(".clip-title")
              , a = e.querySelector(".iframe")
              , o = e.querySelector(".decision-img")
              , e = (e.querySelector(".decision-translation"),
            e.querySelector(".additional-img"),
            parseInt(e.dataset.index))
              , n = k[e + 1]
              , e = e + 1
              , r = "".concat(C).concat(e + 1);
            f(a, o, n, t, r, e),
            x(n, r)
        }
        function _(e) {
            var t = (e = e.target.closest(".modal__box")).querySelector(".clip-title")
              , a = e.querySelector(".iframe")
              , o = e.querySelector(".decision-img")
              , e = (e.querySelector(".decision-translation"),
            e.querySelector(".additional-img"),
            parseInt(e.dataset.index))
              , n = k[e - 1]
              , r = e - 1
              , e = "".concat(C).concat(e);
            f(a, o, n, t, e, r),
            x(n, e)
        }
        s.addEventListener("click", function() {
            l.classList.toggle("none"),
            s.classList.toggle("opacity")
        }),
        e = parseInt(e.target.dataset.index),
        a = k[e].video,
        o = k[e].decision,
        n = "".concat(C).concat(e + 1),
        g.dataset.index = e,
        d.textContent = n,
        u.setAttribute("src", a),
        y.setAttribute("src", o),
        y.setAttribute("alt", "Decyzja klipu ".concat(n)),
        A.hasOwnProperty("translation") ? (a = k[e].translation,
        v.style.display = "block",
        v.textContent = a) : v.style.display = "none",
        0 === e && b.classList.add("disabled"),
        e === E - 1 && p.classList.add("disabled"),
        k[e].hasOwnProperty("additional-explanation") && (o = k[e].explanation,
        a = k[e].translation,
        v.style.display = "block",
        S.setAttribute("src", o),
        S.setAttribute("alt", "WyjaÅ›nienie klipu ".concat(n)),
        v.textContent = a),
        modalContainer.appendChild(r),
        c.addEventListener("click", function() {
            m.classList.toggle("hidden")
        }),
        i.addEventListener("click", function() {
            q(modalContainer)
        }),
        modalContainer.addEventListener("click", function(e) {
            "modal__container modal-container modal-active" != e.target.classList.value && "modal" != e.target.classList.value || q(modalContainer)
        }),
        p.addEventListener("click", function(e) {
            var t = parseInt(e.target.closest(".modal__box").dataset.index) + 1;
            -1 !== t && e.target.closest(".modal__box").querySelector(".previous-btn").classList.remove("disabled"),
            t === E - 1 ? (h(e),
            p.classList.add("disabled")) : h(e)
        }),
        b.addEventListener("click", function(e) {
            var t = parseInt(e.target.closest(".modal__box").dataset.index) - 1;
            t == E - 2 && e.target.closest(".modal__box").querySelector(".next-btn").classList.remove("disabled"),
            0 == t ? (_(e),
            b.classList.add("disabled")) : _(e)
        })
    }
    var C = body.dataset.symbol
      , k = e.data[C].content
      , A = e.data[C]
      , E = k.length
      , B = e.data.dictionary[C]
      , e = (pageTitle.textContent = e.data[C].category,
    document.title = "UEFA RAP 2023:1 - " + e.data[C].category,
    k.forEach(function(e) {
        var t = clipTemplateTag.content.cloneNode(!0)
          , a = t.querySelector(".clip-item")
          , o = t.querySelector(".clip-number-span")
          , n = t.querySelector(".thumbnail")
          , r = e.id
          , e = e.thumbnail
          , i = "".concat(C).concat(r + 1);
        a.dataset.index = r,
        o.textContent = i,
        n.setAttribute("src", e),
        n.setAttribute("alt", "Klip nr ".concat(i)),
        galleryContainer.appendChild(t)
    }),
    "" != galleryContainer.innerHTML && (loaderBox.style.display = "none"),
    document.querySelectorAll(".clip-item"));
    e.forEach(function(e) {
        return e.addEventListener("click", t)
    })
}).catch(function() {
    console.log(err)
}),
accordionBtns.forEach(function(e) {
    return e.addEventListener("click", openAccordionItems)
}),
burgerBtn.addEventListener("click", handleNav),
burgerNav.addEventListener("click", closeNavOutsideBox);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsaXBzLmpzIl0sIm5hbWVzIjpbImNsaXBUZW1wbGF0ZVRhZyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImdhbGxlcnlDb250YWluZXIiLCJtb2RhbFRlbXBsYXRlVGFnIiwibW9kYWxDb250YWluZXIiLCJhY2NvcmRpb25CdG5zIiwiYWNjb3JkaW9uSW5mb3MiLCJidXJnZXJOYXYiLCJxdWVyeVNlbGVjdG9yQWxsIiwiYnVyZ2VyQnRuIiwiZmlyc3RCYXIiLCJzZWNvbmRCYXIiLCJ0aGlyZEJhciIsImxvYWRlckJveCIsInBhZ2VUaXRsZSIsImJvZHkiLCJoYW5kbGVOYXYiLCJmb3JFYWNoIiwiZWwiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJ0b2dnbGUiLCJjbG9zZU5hdk91dHNpZGVCb3giLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwiY29udGFpbnMiLCJ0YXJnZXQiLCJvcGVuQWNjb3JkaW9uSXRlbXMiLCJ0aGlzIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiYXhpb3MiLCJnZXQiLCJVUkwiLCJ0aGVuIiwicmVzIiwiZGF0YXNldCIsIm1vZGFsVGVtcGxhdGUiLCJkZWNpc2lvbkJ0biIsIml0ZW0iLCJtb2RhbFRpdGxlIiwiaWZyYW1lQm94IiwiZGVjaXNpb25JbWdCb3giLCJkaWN0aW9uYXJ5IiwiY2xvbmVOb2RlIiwiY2xvc2VCdG4iLCJoZWxwQnRuIiwiZGVjaXNpb25Cb3giLCJwcmV2aW91c0J0biIsImRlY2lzaW9uVHJhbnNsYXRpb24iLCJuZXh0QnRuIiwiYWRkaXRpb25hbEV4cGxhbmF0aW9uSW1nIiwibW9kYWxCb3giLCJkaWN0aW9uYXJ5VHJhbnNsYXRpb25zIiwiZGlzcGxheSIsImFkZFRyYW5zbGF0aW9uIiwic3R5bGUiLCJwIiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImNvbmNhdCIsImNsb3NlTW9kYWwiLCJwYXJlbnQiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJhY3RpdmUiLCJwdXROZXdEYXRhIiwic2V0QXR0cmlidXRlIiwiZGVjaXNpb25JbWciLCJkZWNpc2lvbiIsImNsaXBUaXRsZSIsIm5ld0luZGV4IiwidGl0bGUiLCJpbmRleCIsImlmcmFtZSIsInRyYW5zbGF0aW9uIiwidGV4dENvbnRlbnQiLCJkYXRhU3ltYm9sIiwiaGFzT3duUHJvcGVydHkiLCJoYW5kbGVUcmFuc2xhdGlvbiIsImRhdGEiLCJhZGRpdGlvbmFsVHJhbnNsYXRlIiwiYWRkaXRpb25hbEltZyIsIm5leHRDbGlwIiwiY2xvc2VzdCIsImNsaXBJbmRleCIsInBhcnNlSW50IiwiYm9keVN5bWJvbCIsIm5leHREYXRhIiwicHJldmlvdXNDbGlwIiwicHJldkRhdGEiLCJ0b2dnbGVWaXNpYmlsaXR5IiwidmlkZW8iLCJjbGlwSWQiLCJhZGRFdmVudExpc3RlbmVyIiwiY2xpcE5hbWUiLCJhZGQiLCJleHBsYW5hdGlvbiIsImFwcGVuZENoaWxkIiwibW9kYWxJbmRleCIsInZhbHVlIiwiYXJyTGVuZ3RoIiwic3ltYm9sIiwiY29udGVudCIsImxlbmd0aCIsImNhdGVnb3J5IiwiY3JlYXRlVGh1bWJuYWlsIiwiY2xpcEl0ZW0iLCJjbGlwTnVtYmVyU3BhbiIsImNsaXBUaHVtYm5haWwiLCJjbGlwVGVtcGxhdGUiLCJpZCIsInRodW1ibmFpbCIsImNsaXBzIiwiY2xpcCIsInNob3dNb2RhbCIsImNvbnNvbGUiLCJsb2ciLCJlcnIiLCJidG4iXSwibWFwcGluZ3MiOiJhQUFBLElBQU1BLGdCQUFrQkMsU0FBU0MsY0FBYyxrQkFDOUNDLGlCQUFtQkYsU0FBU0MsY0FBYyx1QkFEM0NFLGlCQUFxQkgsU0FBR0EsY0FBU0MsbUJBQWpDRyxlQUNDRixTQUFtQkYsY0FBU0Msb0JBRDdCSSxjQUVDRixTQUFtQkgsaUJBQVNDLDJCQUY3QkssZUFHZU4sU0FBR0EsaUJBQXVCLG9CQUh6Q08sVUFJQ0YsU0FBZ0JMLGNBQVNRLG9CQUoxQkMsVUFLQ0gsU0FBaUJOLGNBQVNRLGVBTDNCRSxTQU1DSCxTQUFZUCxjQUFTQyx5QkFOdEJVLFVBT1VYLFNBQUdBLGNB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NUIxQixFQUFhMUMsRUFBSTZDLEtBQUtPLEdBQ3RCYyxFQUFZckIsRUFBS3dCLE9BSXZCekYsRUFBNEJpRSxFQUFLTyxLQUFBQSxXQUFZa0IsR0ErQjVDcEcsR0EvQkRVLFVBQVU2RCxZQUFjekMsRUFBSTZDLEtBQUtPLEdBQVlrQixTQUc3Q3hHLFNBQU15RyxNQUFBQSxxQkFBQUEsRUFBQUEsS0FBd0JuQixHQUFBa0IsU0FDN0J6QixFQUNDOUQsUUFDQ3lGLFNBQUFBLEdBREQsSUFFQ0MsRUFBYzVHLGdCQUFnQkUsUUFBQUEsV0FBYyxHQUQ1Q3lHLEVBRUFFLEVBQWdCQyxjQUFhNUcsY0FEN0IwRyxFQUdERSxFQUFBNUcsY0FBQSxxQkFGQzJHLEVBR2NDLEVBQWY1RyxjQUFBLGNBR0F5RyxFQUFTdkUsRUFBQUEsR0FDVHdFLEVBQWVoQyxFQUFBQSxVQUNmaUMsRUFBQUEsR0FBQUEsT0FBYzFDLEdBQWQwQyxPQUEyQkUsRUFBT0MsR0FGbENMLEVBS0F4RyxRQUFBQSxNQUFpQitGLEVBQ2pCVSxFQWhCRGhDLFlBQUFtQixFQUREYyxFQUFBMUMsYUFBQSxNQUFBNkMsR0FjRUgsRUFBYzFDLGFBQWEsTUFBM0IsV0FBQVAsT0FBNkNtQyxJQUU3QzVGLGlCQUFpQitGLFlBQVlZLEtBU1JyRyxJQUFqQndHLGlCQUFpQnhHLFlBSHRCSyxVQUFVMEMsTUFBTUYsUUFBVSxRQU0xQmpELFNBQWVlLGlCQUFjLGVBbU45QjZGLEVBQU0vRixRQUFRLFNBQUFnRyxHQUFJLE9BQUlBLEVBQUtwQixpQkFBaUIsUUFBU3FCLE9BN1B2RCxNQStQUSxXQUNOQyxRQUFRQyxJQUFJQyxPQUdkaEgsY0FBY1ksUUFBUSxTQUFBcUcsR0FBRyxPQUFJQSxFQUFJekIsaUJBQWlCLFFBQVNsRSxzQkFDM0RsQixVQUFVb0YsaUJBQWlCLFFBQVM3RSxXQUNwQ1QsVUFBVXNGLGlCQUFpQixRQUFTdkUiLCJmaWxlIjoiY2xpcHMubWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY2xpcFRlbXBsYXRlVGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNsaXAtdGVtcGxhdGUnKSxcclxuXHRnYWxsZXJ5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdhbGxlcnlfX2NvbnRhaW5lcicpLFxyXG5cdG1vZGFsVGVtcGxhdGVUYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9kYWwtdGVtcGxhdGUnKSxcclxuXHRtb2RhbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1jb250YWluZXInKSxcclxuXHRhY2NvcmRpb25CdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lbnVfX2l0ZW0tLWV4cGFuZGFibGUnKSxcclxuXHRhY2NvcmRpb25JbmZvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hY2NvcmRpb25fX2luZm8nKSxcclxuXHRidXJnZXJOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2X19idXJnZXItbmF2JyksXHJcblx0YnVyZ2VyQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1cmdlci1idG4nKSxcclxuXHRmaXJzdEJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXJnZXItYnRuX19iYXItLW9uZScpLFxyXG5cdHNlY29uZEJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXJnZXItYnRuX19iYXItLXR3bycpLFxyXG5cdHRoaXJkQmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ1cmdlci1idG5fX2Jhci0tdGhyZWUnKSxcclxuXHRsb2FkZXJCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGVyLWJveCcpLFxyXG5cdHBhZ2VUaXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWdlLXRpdGxlJyksXHJcblx0Ym9keSA9IGRvY3VtZW50LmJvZHlcclxuXHJcbmNvbnN0IFVSTCA9IGBodHRwczovL3VlZmFjbGlwcy5ldS9hcHAtY2xpcHMuanNvbmBcclxuXHJcbmNvbnN0IGhhbmRsZU5hdiA9ICgpID0+IHtcclxuXHRjb25zdCBidXJnZXJOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2X19idXJnZXItbmF2JylcclxuXHRhY2NvcmRpb25JbmZvcy5mb3JFYWNoKGVsID0+IHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcblx0XHRlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpLmNsYXNzTGlzdC5yZW1vdmUoJ3JvdGF0ZScpXHJcblx0fSlcclxuXHRidXJnZXJOYXYuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlLW1lbnUnKVxyXG5cdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnYm9keS1sb2NrJylcclxuXHRmaXJzdEJhci5jbGFzc0xpc3QudG9nZ2xlKCdmaXJzdC1jcm9zcycpXHJcblx0dGhpcmRCYXIuY2xhc3NMaXN0LnRvZ2dsZSgndGhpcmQtY3Jvc3MnKVxyXG5cdHNlY29uZEJhci5jbGFzc0xpc3QudG9nZ2xlKCdzZWNvbmQtY3Jvc3MnKVxyXG59XHJcblxyXG5jb25zdCBjbG9zZU5hdk91dHNpZGVCb3ggPSBlID0+IHtcclxuXHRlLnN0b3BQcm9wYWdhdGlvbigpXHJcblx0aWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlLW1lbnUnKSkge1xyXG5cdFx0YnVyZ2VyTmF2LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1tZW51JylcclxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnYm9keS1sb2NrJylcclxuXHRcdGZpcnN0QmFyLmNsYXNzTGlzdC5yZW1vdmUoJ2ZpcnN0LWNyb3NzJylcclxuXHRcdHRoaXJkQmFyLmNsYXNzTGlzdC5yZW1vdmUoJ3RoaXJkLWNyb3NzJylcclxuXHRcdHNlY29uZEJhci5jbGFzc0xpc3QucmVtb3ZlKCdzZWNvbmQtY3Jvc3MnKVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gb3BlbkFjY29yZGlvbkl0ZW1zKCkge1xyXG5cdHRoaXMubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpXHJcblx0dGhpcy5xdWVyeVNlbGVjdG9yKCdzdmcnKS5jbGFzc0xpc3QudG9nZ2xlKCdyb3RhdGUnKVxyXG59XHJcbmF4aW9zXHJcblx0LmdldChVUkwpXHJcblx0LnRoZW4ocmVzID0+IHtcclxuXHRcdGNvbnN0IGJvZHlTeW1ib2wgPSBib2R5LmRhdGFzZXQuc3ltYm9sXHJcblxyXG5cdFx0Y29uc3QgZGF0YSA9IHJlcy5kYXRhW2JvZHlTeW1ib2xdLmNvbnRlbnRcclxuXHRcdGNvbnN0IGRhdGFTeW1ib2wgPSByZXMuZGF0YVtib2R5U3ltYm9sXVxyXG5cdFx0Y29uc3QgYXJyTGVuZ3RoID0gZGF0YS5sZW5ndGhcclxuXHJcblx0XHRjb25zdCBkaWN0aW9uYXJ5VHJhbnNsYXRpb25zID0gcmVzLmRhdGEuZGljdGlvbmFyeVtib2R5U3ltYm9sXVxyXG5cclxuXHRcdHBhZ2VUaXRsZS50ZXh0Q29udGVudCA9IHJlcy5kYXRhW2JvZHlTeW1ib2xdLmNhdGVnb3J5XHJcblx0XHRkb2N1bWVudC50aXRsZSA9ICdVRUZBIFJBUCAyMDIzOjEgLSAnICsgcmVzLmRhdGFbYm9keVN5bWJvbF0uY2F0ZWdvcnlcclxuXHJcblx0XHRjb25zdCBjcmVhdGVUaHVtYm5haWwgPSAoKSA9PiB7XHJcblx0XHRcdGRhdGEuZm9yRWFjaChlbCA9PiB7XHJcblx0XHRcdFx0Y29uc3QgY2xpcFRlbXBsYXRlID0gY2xpcFRlbXBsYXRlVGFnLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLFxyXG5cdFx0XHRcdFx0Y2xpcEl0ZW0gPSBjbGlwVGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmNsaXAtaXRlbScpLFxyXG5cdFx0XHRcdFx0Y2xpcE51bWJlclNwYW4gPSBjbGlwVGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmNsaXAtbnVtYmVyLXNwYW4nKSxcclxuXHRcdFx0XHRcdGNsaXBUaHVtYm5haWwgPSBjbGlwVGVtcGxhdGUucXVlcnlTZWxlY3RvcignLnRodW1ibmFpbCcpXHJcblxyXG5cdFx0XHRcdGNvbnN0IGlkID0gZWwuaWRcclxuXHRcdFx0XHRjb25zdCB0aHVtYm5haWwgPSBlbC50aHVtYm5haWxcclxuXHRcdFx0XHRjb25zdCBjbGlwTmFtZSA9IGAke2JvZHlTeW1ib2x9JHtpZCArIDF9YFxyXG5cclxuXHRcdFx0XHRjbGlwSXRlbS5kYXRhc2V0LmluZGV4ID0gaWRcclxuXHRcdFx0XHRjbGlwTnVtYmVyU3Bhbi50ZXh0Q29udGVudCA9IGNsaXBOYW1lXHJcblx0XHRcdFx0Y2xpcFRodW1ibmFpbC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRodW1ibmFpbClcclxuXHRcdFx0XHRjbGlwVGh1bWJuYWlsLnNldEF0dHJpYnV0ZSgnYWx0JywgYEtsaXAgbnIgJHtjbGlwTmFtZX1gKVxyXG5cclxuXHRcdFx0XHRnYWxsZXJ5Q29udGFpbmVyLmFwcGVuZENoaWxkKGNsaXBUZW1wbGF0ZSlcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHRjcmVhdGVUaHVtYm5haWwoKVxyXG5cdFx0aWYgKGdhbGxlcnlDb250YWluZXIuaW5uZXJIVE1MICE9ICcnKSB7XHJcblx0XHRcdGxvYWRlckJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2xpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2xpcC1pdGVtJylcclxuXHRcdGNvbnN0IHNob3dNb2RhbCA9IGUgPT4ge1xyXG5cdFx0XHRtb2RhbENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG5cdFx0XHRtb2RhbENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdtb2RhbC1hY3RpdmUnKVxyXG5cdFx0XHRtb2RhbENvbnRhaW5lci5kYXRhc2V0LmFjdGl2ZSA9IHRydWVcclxuXHRcdFx0Ym9keS5jbGFzc0xpc3QuYWRkKCdib2R5LWxvY2snKVxyXG5cclxuXHRcdFx0Y29uc3QgbW9kYWxUZW1wbGF0ZSA9IG1vZGFsVGVtcGxhdGVUYWcuY29udGVudC5jbG9uZU5vZGUodHJ1ZSksXHJcblx0XHRcdFx0Y2xvc2VCdG4gPSBtb2RhbFRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5jbG9zZScpLFxyXG5cdFx0XHRcdGRlY2lzaW9uQnRuID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuZGVjaXNpb24nKSxcclxuXHRcdFx0XHRoZWxwQnRuID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuaGVscC1zdmcnKSxcclxuXHRcdFx0XHRkaWN0aW9uYXJ5ID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuZGljdGlvbmFyeScpLFxyXG5cdFx0XHRcdG1vZGFsVGl0bGUgPSBtb2RhbFRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5jbGlwLXRpdGxlJyksXHJcblx0XHRcdFx0aWZyYW1lQm94ID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuaWZyYW1lJyksXHJcblx0XHRcdFx0ZGVjaXNpb25Cb3ggPSBtb2RhbFRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5kZWNpc2lvbi1ib3gnKSxcclxuXHRcdFx0XHRkZWNpc2lvbkltZ0JveCA9IG1vZGFsVGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmRlY2lzaW9uLWltZycpLFxyXG5cdFx0XHRcdG5leHRCdG4gPSBtb2RhbFRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5uZXh0LWJ0bicpLFxyXG5cdFx0XHRcdHByZXZpb3VzQnRuID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcucHJldmlvdXMtYnRuJyksXHJcblx0XHRcdFx0bW9kYWxCb3ggPSBtb2RhbFRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbF9fYm94JyksXHJcblx0XHRcdFx0ZGVjaXNpb25UcmFuc2xhdGlvbiA9IG1vZGFsVGVtcGxhdGUucXVlcnlTZWxlY3RvcignLmRlY2lzaW9uLXRyYW5zbGF0aW9uJyksXHJcblx0XHRcdFx0YWRkaXRpb25hbEV4cGxhbmF0aW9uSW1nID0gbW9kYWxUZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKCcuYWRkaXRpb25hbC1pbWcnKVxyXG5cclxuXHRcdFx0aWYgKCFkaWN0aW9uYXJ5VHJhbnNsYXRpb25zKSB7XHJcblx0XHRcdFx0aGVscEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGFkZFRyYW5zbGF0aW9uID0gKCkgPT4ge1xyXG5cdFx0XHRcdGZvciAoY29uc3QgaXRlbSBpbiBkaWN0aW9uYXJ5VHJhbnNsYXRpb25zKSB7XHJcblx0XHRcdFx0XHRjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpXHJcblx0XHRcdFx0XHRwLmlubmVySFRNTCA9IGA8c3Bhbj4ke2l0ZW19PC9zcGFuPiAtICR7ZGljdGlvbmFyeVRyYW5zbGF0aW9uc1tpdGVtXX1gXHJcblx0XHRcdFx0XHRkaWN0aW9uYXJ5LmFwcGVuZChwKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0YWRkVHJhbnNsYXRpb24oKVxyXG5cclxuXHRcdFx0Y29uc3QgdG9nZ2xlRGljdGlvbmFyeSA9ICgpID0+IHtcclxuXHRcdFx0XHRkaWN0aW9uYXJ5LmNsYXNzTGlzdC50b2dnbGUoJ25vbmUnKVxyXG5cdFx0XHRcdGhlbHBCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnb3BhY2l0eScpXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGhlbHBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVEaWN0aW9uYXJ5KVxyXG5cclxuXHRcdFx0Y29uc3QgcHV0RGF0YSA9ICgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBjbGlwSWQgPSBwYXJzZUludChlLnRhcmdldC5kYXRhc2V0LmluZGV4KVxyXG5cdFx0XHRcdGNvbnN0IHZpZGVvID0gZGF0YVtjbGlwSWRdLnZpZGVvXHJcblx0XHRcdFx0Y29uc3QgZGVjaXNpb25JbWcgPSBkYXRhW2NsaXBJZF0uZGVjaXNpb25cclxuXHRcdFx0XHRjb25zdCBjbGlwTmFtZSA9IGAke2JvZHlTeW1ib2x9JHtjbGlwSWQgKyAxfWBcclxuXHJcblx0XHRcdFx0bW9kYWxCb3guZGF0YXNldC5pbmRleCA9IGNsaXBJZFxyXG5cdFx0XHRcdG1vZGFsVGl0bGUudGV4dENvbnRlbnQgPSBjbGlwTmFtZVxyXG5cdFx0XHRcdGlmcmFtZUJveC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHZpZGVvKVxyXG5cdFx0XHRcdGRlY2lzaW9uSW1nQm94LnNldEF0dHJpYnV0ZSgnc3JjJywgZGVjaXNpb25JbWcpXHJcblx0XHRcdFx0ZGVjaXNpb25JbWdCb3guc2V0QXR0cmlidXRlKCdhbHQnLCBgRGVjeXpqYSBrbGlwdSAke2NsaXBOYW1lfWApXHJcblxyXG5cdFx0XHRcdGlmIChkYXRhU3ltYm9sLmhhc093blByb3BlcnR5KCd0cmFuc2xhdGlvbicpKSB7XHJcblx0XHRcdFx0XHRjb25zdCB0cmFuc2xhdGlvbiA9IGRhdGFbY2xpcElkXS50cmFuc2xhdGlvblxyXG5cdFx0XHRcdFx0ZGVjaXNpb25UcmFuc2xhdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cdFx0XHRcdFx0ZGVjaXNpb25UcmFuc2xhdGlvbi50ZXh0Q29udGVudCA9IHRyYW5zbGF0aW9uXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGRlY2lzaW9uVHJhbnNsYXRpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGNsaXBJZCA9PT0gMCkge1xyXG5cdFx0XHRcdFx0cHJldmlvdXNCdG4uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGNsaXBJZCA9PT0gYXJyTGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdFx0bmV4dEJ0bi5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoZGF0YVtjbGlwSWRdLmhhc093blByb3BlcnR5KCdhZGRpdGlvbmFsLWV4cGxhbmF0aW9uJykpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGFkZGl0aW9uYWxJbWcgPSBkYXRhW2NsaXBJZF0uZXhwbGFuYXRpb25cclxuXHRcdFx0XHRcdGNvbnN0IGFkZGl0aW9uYWxUcmFuc2xhdGUgPSBkYXRhW2NsaXBJZF0udHJhbnNsYXRpb25cclxuXHRcdFx0XHRcdGRlY2lzaW9uVHJhbnNsYXRpb24uc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHRcdFx0XHRcdGFkZGl0aW9uYWxFeHBsYW5hdGlvbkltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGFkZGl0aW9uYWxJbWcpXHJcblx0XHRcdFx0XHRhZGRpdGlvbmFsRXhwbGFuYXRpb25JbWcuc2V0QXR0cmlidXRlKCdhbHQnLCBgV3lqYcWbbmllbmllIGtsaXB1ICR7Y2xpcE5hbWV9YClcclxuXHRcdFx0XHRcdGRlY2lzaW9uVHJhbnNsYXRpb24udGV4dENvbnRlbnQgPSBhZGRpdGlvbmFsVHJhbnNsYXRlXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRtb2RhbENvbnRhaW5lci5hcHBlbmRDaGlsZChtb2RhbFRlbXBsYXRlKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwdXREYXRhKClcclxuXHJcblx0XHRcdGNvbnN0IGNsb3NlTW9kYWwgPSBwYXJlbnQgPT4ge1xyXG5cdFx0XHRcdG1vZGFsQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcblx0XHRcdFx0bW9kYWxDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtYWN0aXZlJylcclxuXHRcdFx0XHRtb2RhbENvbnRhaW5lci5kYXRhc2V0LmFjdGl2ZSA9IGZhbHNlXHJcblx0XHRcdFx0Ym9keS5jbGFzc0xpc3QucmVtb3ZlKCdib2R5LWxvY2snKVxyXG5cdFx0XHRcdHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG5cdFx0XHRcdFx0cGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgcHV0TmV3RGF0YSA9IChpZnJhbWUsIGRlY2lzaW9uSW1nLCBkYXRhLCB0aXRsZSwgY2xpcFRpdGxlLCBuZXdJbmRleCkgPT4ge1xyXG5cdFx0XHRcdHRpdGxlLnRleHRDb250ZW50ID0gY2xpcFRpdGxlXHJcblx0XHRcdFx0bW9kYWxCb3guZGF0YXNldC5pbmRleCA9IG5ld0luZGV4XHJcblxyXG5cdFx0XHRcdGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIGRhdGEudmlkZW8pXHJcblx0XHRcdFx0ZGVjaXNpb25JbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBkYXRhLmRlY2lzaW9uKVxyXG5cdFx0XHRcdGRlY2lzaW9uSW1nLnNldEF0dHJpYnV0ZSgnYWx0JywgYERlY3l6amEga2xpcHUgJHtjbGlwVGl0bGV9YClcclxuXHJcblx0XHRcdFx0aWYgKGRhdGFTeW1ib2wuaGFzT3duUHJvcGVydHkoJ3RyYW5zbGF0aW9uJykpIHtcclxuXHRcdFx0XHRcdGNvbnN0IHRyYW5zbGF0aW9uID0gZGF0YS50cmFuc2xhdGlvblxyXG5cdFx0XHRcdFx0ZGVjaXNpb25UcmFuc2xhdGlvbi50ZXh0Q29udGVudCA9IHRyYW5zbGF0aW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnN0IGhhbmRsZVRyYW5zbGF0aW9uID0gKGRhdGEsIGNsaXBUaXRsZSkgPT4ge1xyXG5cdFx0XHRcdGlmIChkYXRhLmhhc093blByb3BlcnR5KCdhZGRpdGlvbmFsLWV4cGxhbmF0aW9uJykgJiYgIWRhdGFTeW1ib2wuaGFzT3duUHJvcGVydHkoJ3RyYW5zbGF0aW9uJykpIHtcclxuXHRcdFx0XHRcdGlmIChkYXRhLmhhc093blByb3BlcnR5KCdhZGRpdGlvbmFsLWV4cGxhbmF0aW9uJykpIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgYWRkaXRpb25hbEltZyA9IGRhdGEuZXhwbGFuYXRpb25cclxuXHRcdFx0XHRcdFx0Y29uc3QgYWRkaXRpb25hbFRyYW5zbGF0ZSA9IGRhdGEudHJhbnNsYXRpb25cclxuXHRcdFx0XHRcdFx0YWRkaXRpb25hbEV4cGxhbmF0aW9uSW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgYWRkaXRpb25hbEltZylcclxuXHRcdFx0XHRcdFx0YWRkaXRpb25hbEV4cGxhbmF0aW9uSW1nLnNldEF0dHJpYnV0ZSgnYWx0JywgYFd5amHFm25pZW5pZSBrbGlwdSAke2NsaXBUaXRsZX1gKVxyXG5cdFx0XHRcdFx0XHRkZWNpc2lvblRyYW5zbGF0aW9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblx0XHRcdFx0XHRcdGRlY2lzaW9uVHJhbnNsYXRpb24udGV4dENvbnRlbnQgPSBhZGRpdGlvbmFsVHJhbnNsYXRlXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYWRkaXRpb25hbC1leHBsYW5hdGlvbicpICYmICFkYXRhU3ltYm9sLmhhc093blByb3BlcnR5KCd0cmFuc2xhdGlvbicpKSB7XHJcblx0XHRcdFx0XHRhZGRpdGlvbmFsRXhwbGFuYXRpb25JbWcuc2V0QXR0cmlidXRlKCdzcmMnLCAnJylcclxuXHRcdFx0XHRcdGFkZGl0aW9uYWxFeHBsYW5hdGlvbkltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsICcnKVxyXG5cdFx0XHRcdFx0ZGVjaXNpb25UcmFuc2xhdGlvbi50ZXh0Q29udGVudCA9ICcnXHJcblx0XHRcdFx0XHRkZWNpc2lvblRyYW5zbGF0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IG5leHRDbGlwID0gZSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgbW9kYWxCb3ggPSBlLnRhcmdldC5jbG9zZXN0KCcubW9kYWxfX2JveCcpLFxyXG5cdFx0XHRcdFx0dGl0bGUgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuY2xpcC10aXRsZScpLFxyXG5cdFx0XHRcdFx0aWZyYW1lID0gbW9kYWxCb3gucXVlcnlTZWxlY3RvcignLmlmcmFtZScpLFxyXG5cdFx0XHRcdFx0ZGVjaXNpb25JbWcgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuZGVjaXNpb24taW1nJyksXHJcblx0XHRcdFx0XHRkZWNpc2lvblRyYW5zbGF0aW9uID0gbW9kYWxCb3gucXVlcnlTZWxlY3RvcignLmRlY2lzaW9uLXRyYW5zbGF0aW9uJyksXHJcblx0XHRcdFx0XHRhZGRpdGlvbmFsRXhwbGFuYXRpb25JbWcgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuYWRkaXRpb25hbC1pbWcnKVxyXG5cclxuXHRcdFx0XHRsZXQgY2xpcEluZGV4ID0gcGFyc2VJbnQobW9kYWxCb3guZGF0YXNldC5pbmRleClcclxuXHJcblx0XHRcdFx0Y29uc3QgbmV4dERhdGEgPSBkYXRhW2NsaXBJbmRleCArIDFdXHJcblxyXG5cdFx0XHRcdGxldCBuZXdJbmRleCA9IGNsaXBJbmRleCArIDFcclxuXHRcdFx0XHRjb25zdCBjbGlwVGl0bGUgPSBgJHtib2R5U3ltYm9sfSR7bmV3SW5kZXggKyAxfWBcclxuXHJcblx0XHRcdFx0cHV0TmV3RGF0YShpZnJhbWUsIGRlY2lzaW9uSW1nLCBuZXh0RGF0YSwgdGl0bGUsIGNsaXBUaXRsZSwgbmV3SW5kZXgpXHJcblx0XHRcdFx0aGFuZGxlVHJhbnNsYXRpb24obmV4dERhdGEsIGNsaXBUaXRsZSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgcHJldmlvdXNDbGlwID0gZSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgbW9kYWxCb3ggPSBlLnRhcmdldC5jbG9zZXN0KCcubW9kYWxfX2JveCcpLFxyXG5cdFx0XHRcdFx0dGl0bGUgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuY2xpcC10aXRsZScpLFxyXG5cdFx0XHRcdFx0aWZyYW1lID0gbW9kYWxCb3gucXVlcnlTZWxlY3RvcignLmlmcmFtZScpLFxyXG5cdFx0XHRcdFx0ZGVjaXNpb25JbWcgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuZGVjaXNpb24taW1nJyksXHJcblx0XHRcdFx0XHRkZWNpc2lvblRyYW5zbGF0aW9uID0gbW9kYWxCb3gucXVlcnlTZWxlY3RvcignLmRlY2lzaW9uLXRyYW5zbGF0aW9uJyksXHJcblx0XHRcdFx0XHRhZGRpdGlvbmFsRXhwbGFuYXRpb25JbWcgPSBtb2RhbEJveC5xdWVyeVNlbGVjdG9yKCcuYWRkaXRpb25hbC1pbWcnKVxyXG5cclxuXHRcdFx0XHRsZXQgY2xpcEluZGV4ID0gcGFyc2VJbnQobW9kYWxCb3guZGF0YXNldC5pbmRleClcclxuXHJcblx0XHRcdFx0Y29uc3QgcHJldkRhdGEgPSBkYXRhW2NsaXBJbmRleCAtIDFdXHJcblxyXG5cdFx0XHRcdGxldCBuZXdJbmRleCA9IGNsaXBJbmRleCAtIDFcclxuXHRcdFx0XHRjb25zdCBjbGlwVGl0bGUgPSBgJHtib2R5U3ltYm9sfSR7Y2xpcEluZGV4fWBcclxuXHJcblx0XHRcdFx0cHV0TmV3RGF0YShpZnJhbWUsIGRlY2lzaW9uSW1nLCBwcmV2RGF0YSwgdGl0bGUsIGNsaXBUaXRsZSwgbmV3SW5kZXgpXHJcblx0XHRcdFx0aGFuZGxlVHJhbnNsYXRpb24ocHJldkRhdGEsIGNsaXBUaXRsZSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgdG9nZ2xlVmlzaWJpbGl0eSA9IGl0ZW0gPT4ge1xyXG5cdFx0XHRcdGl0ZW0uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJylcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZGVjaXNpb25CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdFx0dG9nZ2xlVmlzaWJpbGl0eShkZWNpc2lvbkJveClcclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0XHRcdGNsb3NlTW9kYWwobW9kYWxDb250YWluZXIpXHJcblx0XHRcdH0pXHJcblxyXG5cdFx0XHRtb2RhbENvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG5cdFx0XHRcdGlmIChcclxuXHRcdFx0XHRcdGUudGFyZ2V0LmNsYXNzTGlzdC52YWx1ZSA9PSAnbW9kYWxfX2NvbnRhaW5lciBtb2RhbC1jb250YWluZXIgbW9kYWwtYWN0aXZlJyB8fFxyXG5cdFx0XHRcdFx0ZS50YXJnZXQuY2xhc3NMaXN0LnZhbHVlID09ICdtb2RhbCdcclxuXHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdGNsb3NlTW9kYWwobW9kYWxDb250YWluZXIpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0bmV4dEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG1vZGFsSW5kZXggPSBwYXJzZUludChlLnRhcmdldC5jbG9zZXN0KCcubW9kYWxfX2JveCcpLmRhdGFzZXQuaW5kZXgpICsgMVxyXG5cdFx0XHRcdGlmIChtb2RhbEluZGV4ICE9PSAtMSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgcHJldmlvdXNCdG4gPSBlLnRhcmdldC5jbG9zZXN0KCcubW9kYWxfX2JveCcpLnF1ZXJ5U2VsZWN0b3IoJy5wcmV2aW91cy1idG4nKVxyXG5cdFx0XHRcdFx0cHJldmlvdXNCdG4uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAobW9kYWxJbmRleCA9PT0gYXJyTGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdFx0bmV4dENsaXAoZSlcclxuXHRcdFx0XHRcdG5leHRCdG4uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRuZXh0Q2xpcChlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHJcblx0XHRcdHByZXZpb3VzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgbW9kYWxJbmRleCA9IHBhcnNlSW50KGUudGFyZ2V0LmNsb3Nlc3QoJy5tb2RhbF9fYm94JykuZGF0YXNldC5pbmRleCkgLSAxXHJcblx0XHRcdFx0aWYgKG1vZGFsSW5kZXggPT09IGFyckxlbmd0aCAtIDIpIHtcclxuXHRcdFx0XHRcdGNvbnN0IG5leHRCdG4gPSBlLnRhcmdldC5jbG9zZXN0KCcubW9kYWxfX2JveCcpLnF1ZXJ5U2VsZWN0b3IoJy5uZXh0LWJ0bicpXHJcblx0XHRcdFx0XHRuZXh0QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJylcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChtb2RhbEluZGV4ID09PSAwKSB7XHJcblx0XHRcdFx0XHRwcmV2aW91c0NsaXAoZSlcclxuXHRcdFx0XHRcdHByZXZpb3VzQnRuLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJylcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cHJldmlvdXNDbGlwKGUpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdFx0Y2xpcHMuZm9yRWFjaChjbGlwID0+IGNsaXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93TW9kYWwpKVxyXG5cdH0pXHJcblx0LmNhdGNoKCgpID0+IHtcclxuXHRcdGNvbnNvbGUubG9nKGVycilcclxuXHR9KVxyXG5cclxuYWNjb3JkaW9uQnRucy5mb3JFYWNoKGJ0biA9PiBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvcGVuQWNjb3JkaW9uSXRlbXMpKVxyXG5idXJnZXJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVOYXYpXHJcbmJ1cmdlck5hdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlTmF2T3V0c2lkZUJveClcclxuIl19