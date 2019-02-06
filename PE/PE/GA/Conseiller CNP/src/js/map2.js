/* ================ Ensemble de fonctions qui gère le dynamisme des radio/checkbox/select   ==================== */


/* LISTENER SUR LES GROUPES RADIO POUR AFFICHER / MASQUER DES BLOCS */
/* exemple d'utilisation :  $('[name="inscrit"]').changeRadioListener(); */
jQuery.fn.changeRadioListener = function() {
    var delegateSelector = '[name="' + jQuery(this).attr('name') + '"]'; // Le selecteur à utiliser pour la délégation

    return this.each(function() {
        // On délégue la gestion de l'événement au document dans un soucis de résilience (Ex: rechargement Ajax de la zone)
        jQuery(document).on('change', delegateSelector, function() {
            // Pour chaque élément du groupe de bouton radion on vérifie l'état (selectionné ou pas) et on synchronise l'affichage en fonction
            jQuery(delegateSelector).each(function() {
                var $this = jQuery(this), // Pour futur utilisation dans le contexte de la boucle
                    targetIds = $this.data('target') ? $this.data('target').split(" ") : false; // Est-ce qu'on a un/des blocs à afficher/masquer ?
                if (targetIds) {
                    // Pour chaque bloc associé, on affiche/masque selon que le bouton radio soit selectionné ou pas
                    jQuery.each(targetIds, function(key, value) {
                        // Si le bouton radio est coché...
                        if ($this.is(':checked')) {
                            jQuery('#' + value).removeClass('hidden').addClass('fadeIn'); // .. On s'assure que les blocs associés sont visibles
                        } else {
                            jQuery('#' + value).addClass('hidden').removeClass('fadeIn'); // .. Sinon on s'assure qu'ils sont masqués
                        }
                    });
                    // Dans tous les cas on met à jour l'attribut aria-expanded pour refleter l'affichage mis à jour
                    $this.attr('aria-expanded', $this.is(':checked'));
                }
            });
        });
    });
};

/* LISTENER SUR CHECKBOX POUR AFFICHER / MASQUER UN BLOC */
/* exemple d'utilisation :  $('#nomdelacheckbox').changeCheckboxListener(); */
jQuery.fn.changeCheckboxListener = function() {
    var id,
        $el;

    return this.each(function() {
        $el = jQuery(this);

        $el.change(function() {
            // On affiche le nouveau contenu
            var expanded = jQuery(this).attr('aria-expanded');
            jQuery(this).attr('aria-expanded', !expanded);
            id = jQuery(this).attr('data-target');
            $current = id.split(" ");
            jQuery.each($current, function(key, value) {
                jQuery('#' + value).toggleClass('hidden fadeIn').removeClass('fadeIn');
            });
        });
    });
};

/* LISTENER SUR SELECT */
/* exemple d'utilisation :  $('#nomduselect').changeSelectListener(); */
jQuery.fn.changeSelectListener = function(selected) {
    var id,
        $el,
        $current,
        $current_input;

    return this.each(function() {
        $el = jQuery(this);
        if (selected) {
            $current = new Array(selected);
            $current_input = jQuery(this);
        }
        $el.change(function() {
            // On masque le contenu précédent

            if (typeof $current !== 'undefined') {
                $.each($current, function(key, value) {
                    jQuery('#' + value).addClass('hidden').removeClass('fadeIn');
                    jQuery('#' + value).attr('aria-expanded', 'false');
                });
            }

            // On affiche le nouveau contenu
            var $option = jQuery(this).find(":selected");
            // console.log($option);
            $option.attr('aria-expanded', 'true');
            id = $option.attr('data-target');
            // console.log(id);
            $current = id.split(" ");
            $current_input = jQuery(this);
            $.each($current, function(key, value) {
                jQuery('#' + value).removeClass('hidden').addClass('fadeIn');
            });
        });
    });
};

/* ================ Tooltip sur boutons pressés  ==================== */

// Methode permettant de permuter le contenu des tooltips associés à des boutons ayant un aspect pressé ou non
function toggleTooltipLabel() {

    $(document).on('click', '.result .media-right [data-tooltip]', function() {
        var $this = $(this);

        var $tooltipInner, label;

        $tooltipInner = $this.next().find('.tooltip-inner');

        // Le composant "button" de Boostrap change la class collapsed selon l'état donc on peut s'appuyer desssus

        if ($this.hasClass('collapsed')) {
            label = $this.data('unpressedTitle');
        } else {
            label = $this.data('pressedTitle');
        }
        $tooltipInner.text(label);
        $this.attr('data-original-title', label);
    });
}


/* ================ Detection de l'utilisation d'un apareil mobile   ==================== */

var isMobile = {
    Android: function() {
        return window.navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return window.navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return window.navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return window.navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
    }
};

/* ================ Scroll animé  ==================== */

/**
 * Fonction pour scroller avec animation vers un élément de la page
 * @var int scrollValue : la nouvelle position du scroll
 *					accepte aussi la valeur "firstError" pour positionner le scroll au niveau de la première erreur
 * @var timing int : la durée de l'animation
 * @var selector string : le selecteur jQuery pour la racine du scroll. Si null, "html,body"
 **/
function animateScrollTo(scrollValue, timing, selector) {
    var defaults = {
            scrollValue: 0,
            timing: 400,
            selector: 'html,body'
        },
        userOptions = {
            scrollValue: scrollValue,
            timing: timing,
            selector: selector
        },
        options = jQuery.extend(defaults, userOptions);


    $(options.selector).animate({
        scrollTop: options.scrollValue
    }, options.timing); // The number here represents the speed of the scroll in milliseconds
}

$(document).ready(function($) {


    /** ====================== HEADER : POPINS ET DROPDOWN ============================
     * Gestion de l'ouverture/fermeture des boutons principaux du header :
     * - Menu burger
     * - Menu utilisateur
     * - Menu de recherche
     * On s'appuie sur les événements Bootstrap déclenchés par les data-toggle à l'ouverture et à la fermeture
     *
     **/

    var $body = $('body'); // On commence par stocker l'objet jQuery pour le body

    // On attache un listener aux événements "show" et "hide" pour modal et "show pour dropdown" et on délégue au parent le plus proche
    // Note: Alors que les modales diffusent l'événement depuis la popin, les dropdown diffusent à partir du premier parent dans le DOM
    $body.on('show.bs.modal hide.bs.modal show.bs.dropdown', '#PopinMenu, .header .dropdown', function(e) {

        // On récupère l'objet jQuery pour la cible de l'événement déclenché
        var eventType = e.type, // Type d'événement "show" ou "hide" pour future référence
            $target = $(e.target), // La cible de l'événement (modal, dropdown)
            $modalOpened = $('.modal.in'); // Selection des modales actuellement ouvertes

        if (eventType == "show" && $modalOpened && $target.parents('#' + $modalOpened.attr('id')).length < 1) {
            $modalOpened.modal("hide"); // On cache toute les autres
        }

        // S'il s'agit d'un événement déclenché par l'ouverture / fermeture d'une modale
        if ($target.data('bs.modal')) {
            var isMenu = $target.attr('id') == "PopinMenu", // On verifie si c'est l'ouverture du menu burger
                toggleTitle = eventType == "show" ? "Fermer le menu" : "Ouvrir le menu",
                modalBodyClass = isMenu ? "modal-menu-open menu-map" : "modal-search-open"; // On définit la classe à mettre/enlever sur le body

            $body.toggleClass(modalBodyClass);
            if (isMenu) { $(".btn-menu").attr('title', toggleTitle); }
        }
    });


    /* Duplication du code pour la modal Autres Apps */

    $body.on('show.bs.modal hide.bs.modal show.bs.dropdown', '#PopinMenuAutresApps', function(e) {

        // On récupère l'objet jQuery pour la cible de l'événement déclenché
        var eventType = e.type, // Type d'événement "show" ou "hide" pour future référence
            $target = $(e.target), // La cible de l'événement (modal, dropdown)
            $modalOpened = $('.modal.in'); // Selection des modales actuellement ouvertes

        if (eventType == "show" && $modalOpened && $target.parents('#' + $modalOpened.attr('id')).length < 1) {
            $modalOpened.modal("hide"); // On cache toute les autres
        }

        // S'il s'agit d'un événement déclenché par l'ouverture / fermeture d'une modale
        if ($target.data('bs.modal')) {
            var isMenu = $target.attr('id') == "PopinMenuAutresApps", // On verifie si c'est l'ouverture du menu burger
                toggleTitle = eventType == "show" ? "Fermer le menu Autres Applications" : "Ouvrir le menu Autres Applications",
                modalBodyClass = isMenu ? "modal-menu-open autres-apps" : "modal-search-open"; // On définit la classe à mettre/enlever sur le body

            $body.toggleClass(modalBodyClass);
            if (isMenu) { $(".header-search-apps .btn").attr('title', toggleTitle); }
        }
    });

    /* Duplication du code pour la modal Notifications */

    $body.on('show.bs.modal hide.bs.modal show.bs.dropdown', '#PopinAlertes', function(e) {

        // On récupère l'objet jQuery pour la cible de l'événement déclenché
        var eventType = e.type, // Type d'événement "show" ou "hide" pour future référence
            $target = $(e.target), // La cible de l'événement (modal, dropdown)
            $modalOpened = $('.modal.in'); // Selection des modales actuellement ouvertes

        if (eventType == "show" && $modalOpened && $target.parents('#' + $modalOpened.attr('id')).length < 1) {
            $modalOpened.modal("hide"); // On cache toute les autres
        }

        // S'il s'agit d'un événement déclenché par l'ouverture / fermeture d'une modale
        if ($target.data('bs.modal')) {
            var isMenu = $target.attr('id') == "PopinAlertes", 
                toggleTitle = eventType == "show" ? "Fermer la fenêtre des notifications" : "Ouvrir la fenêtre des notifications",
                modalBodyClass = isMenu ? "" : "modal-search-open"; // On définit la classe à mettre/enlever sur le body

            $body.toggleClass(modalBodyClass);
            if (isMenu) { $(".notifications .btn-reset").attr('title', toggleTitle); }
        }
    });


    /* ================ Gestion générique si panel-left ou panel-right dans la page  ==================== */

    // On rend la fonctionnalité imperméable au rechargements de zone AJAX
    $('main')
        .on('click', '.btn-panel-filters', function(event) {
            var $this = $(this),
                $body = $('body'),
                toggledClass = 'panel-left-visible';

            // On attache un gestionnaire pour la fermeture du volet au clic sur le panel-center
            // Le gestionnaire sera automatiquement retiré au clic
            $('.panel-center').one('click', function() {
                $body.removeClass(toggledClass);
                $this.attr('aria-expanded', false); // Volet FERMÉ pour les lecteurs d'écran
                return false;
            });

            $('.btn-panel-close').on('click', function() {
                $body.removeClass(toggledClass);
                $this.attr('aria-expanded', false); // Volet FERMÉ pour les lecteurs d'écran
                return false;
            });

            $body.toggleClass(toggledClass);
            $this.attr('aria-expanded', $body.hasClass('toggledClass')); // Volet OUVERT pour les lecteurs d'écran

        });


    $('body').on('show.bs.modal hide.bs.modal', '#PopinRecherche', function(e) {
        $('body').toggleClass("modal-search-open");
    });

    /* ================ TOOLTIP (si l'appareil n'est pas tactile)  ==================== */
    if (!isMobile.any()) {
        $('[data-tooltip]').tooltip().removeAttr('title');
    }

    /* ============================ RETOUR HAUT DE PAGE ================================= */


    $('body').append('<button title="Remonter en haut de page" type="button" class="btn btn-default btn-icon-only hidden link-top"><i class="icon-chevron-up" aria-hidden="true"></i><span class="sr-only">Remonter en haut de page</span></button>');

    var linkTop = $('.link-top'),
        lastScrollTop = 0;
    $(window).scroll(function() {
        if (linkTop.length > 0 && $(window).scrollTop() >= 200) {
            var st = $(this).scrollTop();
            if (st < lastScrollTop) {
                linkTop.removeClass('hidden');
            } else {
                linkTop.addClass('hidden');
            }
            lastScrollTop = st;
        } else {
            linkTop.addClass('hidden');
        }
    });

    $(document).on('click', '.link-top', function(e) {
        e.preventDefault();
        animateScrollTo(0, 700);
        $(this).blur();
    });


    /* ============================ CONTRAST MODE ================================= */

    var accessBtn = $('.switch-access'),
        $body = $('body'),
        COOKIE_NAME = 'access-mode';

    var _cookie = function(name, value) {
        if (typeof value != 'undefined') {
            // Ajout d'un cookie
            var expires = '',
                path = '/';
            var host = location.hostname.replace("www", "");
            document.cookie = name + '=' + encodeURIComponent((!value) ? '' : value) + expires + ';domain=' + host + ';path=' + path;
            return true;
        } else {
            // récuperation de la valeur du cookie
            var cookie, val = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                var clen = cookies.length;
                for (var i = 0; i < clen; ++i) {
                    cookie = jQuery.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        var len = name.length;
                        val = decodeURIComponent(cookie.substring(len + 1));
                        break;
                    }
                }
            }
            return val;
        }
    };

    // Gestion au document ready
    // recuperation du mode d'affichage et si cookie "access-mode" est true alors on active le mode accessibilité
    if (_cookie(COOKIE_NAME) == 'true') {
        $body.addClass('accessibility');
    }

    // Gestion de l'évenement click sur le bouton d'activation
    accessBtn.click(function() {
        if (!$body.hasClass('accessibility')) {
            $body.addClass('accessibility');
            _cookie(COOKIE_NAME, 'true');
        } else {
            $body.removeClass('accessibility');
            _cookie(COOKIE_NAME, 'false');
        }

        // La methode animateScrollTo() est chargée par main.js
        animateScrollTo(0, 400);
    });

    toggleTooltipLabel();


    /* Scripts utilisés uniquement pour des besoins de dynamisme dans les maquettes */

    $('.calendar-wrap').hide();
    $('.datepicker').on('focus', function() { $(this).next().show(); }).on('blur', function() { $(this).next().hide(); });

    /* Clipboard Copy link */
    $("#IdAurelieMartin").on("click", function() {
        $(this).select();
    });


    /* ============================ NAVIGATION MAP ================================= */

    var menuItems = document.querySelectorAll('.has-submenu');
    var menuButtons = document.querySelectorAll('.has-submenu > button');
    var menuItemSelected;

    // Gestion du hover

    Array.prototype.forEach.call(menuItems, function(el, i){
        el.addEventListener("mouseover", function(event){
            this.className = "has-submenu open";
        });

        el.addEventListener("mouseout", function(event){
            document.querySelector(".has-submenu.open").className = "has-submenu";
        });
    });

    Array.prototype.forEach.call(menuButtons, function(el, i){

        // Gestion du focus clavier

        el.addEventListener("focus", function(event) {
            var opennav = document.querySelector(".has-submenu.open")
            if (opennav) {
                opennav.className = "has-submenu";
                opennav.querySelector('button').setAttribute('aria-expanded', "false");
            }
        });

        // Gestion à la touche Entrée

        el.addEventListener("click",  function(event){
            if (this.parentNode.className == "has-submenu") {
                this.parentNode.className = "has-submenu open";
                this.setAttribute('aria-expanded', "true");
                menuItemSelected = this;
            } else {
                this.parentNode.className = "has-submenu";
                this.setAttribute('aria-expanded', "false");
            }
            event.preventDefault();
            return false;
        });
    });

    // Fonction d'échappement quand le menu est ouvert

    function menuEscape(evt){
        evt = evt || window.event;
        if (evt.keyCode == 27) {
            var opennav = document.querySelector(".has-submenu.open")
            if (opennav) {
                opennav.className = "has-submenu";
                opennav.querySelector('button').setAttribute('aria-expanded', "false");
                menuItemSelected.focus();
            }
        }
    }

    document.body.addEventListener('keyup',menuEscape);

    // Gestion du menu sticky

    if(document.querySelector(".with-nav") != null){
        window.onscroll = function() {
            if (window.scrollY > 160) {
                document.querySelector(".with-nav").className = "container-fluid header with-nav reduced";
            }else{
                document.querySelector(".with-nav").className = "container-fluid header with-nav";
            }
        };
    }
});