class SiteNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar">
                <div class="titlename">
                    <a href="index.html">
                        <img class="rawrz"
                             src="images/Circle Cookie Dino.png"
                             height="60">
                        rawrzcookie
                    </a>
                </div>

                <a href="#" class="toggle-button">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </a>

                <div class="vl"></div>

                <div class="navbar-links">
                    <ul>
                        <li><a href="spopti.html">Skill Tree Builder</a></li>
                        <li><a href="setup.html">Build Setup</a></li>
                        <li><a href="gemstones.html">Gemstones</a></li>
                        <li><a href="lbms.html">Mana Optimizer</a></li>
                        <li><a href="soloraid.html">Solo Raid Decks</a></li>
                        <li><a href="https://discord.gg/zhJt63Atn3" style="padding-bottom: 5px;"><img
                                src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg"
                                height="20"></a></li>
                    </ul>
                </div>
            </nav>
        `;
    }
}

customElements.define('site-navbar', SiteNavbar);