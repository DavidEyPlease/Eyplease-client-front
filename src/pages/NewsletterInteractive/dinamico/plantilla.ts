/* La página del boletín dinámico, tal como se aprobó en la muestra local. El motor (motor.js) la llena con los datos
   de la API; aquí sólo está la estructura. La piel cambia las piezas de la plantilla que viajan con la web en
   public/boletin/<piel>: la 10 usa sus letras y su laurel sueltos; la 9 trae sus portadas completas como fondo (el
   título ya viene en el arte), así que esas piezas no se piden. */
export type Piel = 'p9' | 'p10'

export const plantilla = (base: string, piel: Piel): string => {
    const p10 = piel === 'p10'
    return `
<div class="pagina">
    <div class="fondo" aria-hidden="true"></div>

    <header class="barra">
        <button type="button" class="volver" data-volver aria-label="Volver al boletín"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="marca">eyplease<b>+</b></span>
        <span class="quien"><small>Boletín de septiembre</small><b class="unidad"></b></span>
        <nav class="secciones" aria-label="Secciones">
            <a href="#carrera">Carrera</a><a href="#podio">Podio</a><a href="#estrellas">Estrellas</a><a href="#descuento">Descuento</a><a href="#circulo-rosa">Círculo Rosa</a><a href="#dia-por-dia">Día por día</a><a href="#tempraneras" data-tem-link hidden>Tempraneras</a><a href="#iniciadoras">Iniciadoras</a><a href="#camino">Camino</a><a href="#productos">Productos</a><a href="#cumpleanos">Cumpleaños</a><a href="#aniversarios">Aniversarios</a>
        </nav>
        <button type="button" class="ajustes-b junta-b" data-junta aria-label="Modo junta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg><span>Modo junta</span>
        </button>
        <button type="button" class="ajustes-b" data-ajustes aria-expanded="false" aria-controls="ajustes">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span>Ajustes</span>
        </button>
        <div class="ajustes" id="ajustes" hidden>
            <p class="kicker">Ajustes de la Directora</p>
            <small>Esto no lo ven las consultoras: sólo decide qué sale en la junta.</small>
            <label class="mes-t">Mes del boletín <select data-mes-sel></select></label>
            <label class="interruptor"><input type="checkbox" data-tem-on><span></span>Mostrar Tempraneras</label>
            <label class="dia-t">Cuentan las que ordenaron hasta el día <select data-tem-dia></select> de <span class="mes"></span></label>
            <label class="msg-t">Mensaje para tu unidad <small>(opcional, sale al cierre con tu foto)</small><textarea data-msg rows="3" maxlength="280" placeholder="Escribe unas palabras para tu junta…"></textarea></label>
            <p class="nota-a" data-tem-nota hidden>Tempraneras sale de tus órdenes: actívala cuando nos des tu acceso a Mary Kay.</p>
            <p class="guardado" aria-live="polite"></p>
        </div>
    </header>

    <main>
        <!-- 1. Portada: la Directora rodeada de su unidad -->
        <section class="entrada" aria-labelledby="titulo">
            <div class="letras">
                <h1 id="titulo" class="sr">Reconocimiento de <span class="mes"></span></h1>
                ${p10 ? `<img class="l1" src="${base}/portada_titulo.webp" alt="" width="1080" height="191">` : ''}
                <p class="mes-g" aria-hidden="true"><span class="mes"></span></p>
                ${p10 ? `<img class="filete" src="${base}/portada_filete.webp" alt="" width="704" height="72">` : ''}
                <p class="lead"></p>
                <button type="button" class="ir" data-ir>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>
                    Empezar
                </button>
            </div>
            <figure class="dire">
                <div class="ovalo-d"><div class="aro-d"></div><div class="resplandor-d"></div><div class="foto-d"></div></div>
                <figcaption><small class="dire-tit">Tu Directora</small><b class="dire-nombre"></b><span class="dire-nivel"></span></figcaption>
            </figure>
        </section>

        <!-- 2. La carrera -->
        <section class="carrera" id="carrera" aria-label="La carrera, día por día">
            <!-- el Cuadro de Honor: sus letras y el laurel rodeado de las caras de la unidad -->
            <header class="cab-honor revela">
                <div class="burbujas" aria-hidden="true"></div>
                <div class="tit-h">
                    <h2 class="sr">Cuadro de Honor</h2>
                    ${p10 ? `<img src="${base}/honor_linea1.webp" alt="" width="1022" height="223">
                    <img src="${base}/honor_linea2.webp" alt="" width="1031" height="210">` : ''}
                    <p class="kicker">La carrera de <span class="mes"></span></p>
                    <p class="lead-h"></p>
                    <button type="button" class="ir" data-ver>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>
                        Ver la carrera
                    </button>
                </div>
                ${p10 ? `<img class="emb" src="${base}/honor_emblema.webp" alt="" width="945" height="856">` : ''}
            </header>
            <div class="escenario">
                <aside class="lado">
                    <div class="dia" aria-live="polite">
                        <small class="semana"></small>
                        <b><span class="num">1</span><span class="de">de <span class="mes"></span></span></b>
                    </div>
                    <div class="lider">
                        <p class="rotulo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5z"/></svg>Va en primer lugar</p>
                        <div class="ovalo"><div class="aro"></div><div class="caras"></div></div>
                        <b class="nombre">—</b>
                        <span class="pts">0 puntos</span>
                        <small class="desde"></small>
                    </div>
                    <div class="bitacora">
                        <p class="rotulo">Últimas órdenes</p>
                        <ol></ol>
                    </div>
                </aside>
                <div class="tablero">
                    <div class="regla" aria-hidden="true"></div>
                    <div class="pista" role="list"></div>
                    <div class="momento" role="status" aria-live="assertive"><small></small><b></b><span></span></div>
                    <canvas class="chispas" aria-hidden="true"></canvas>
                </div>
                <div class="pie">
                    <div class="mandos">
                        <button type="button" class="play" data-play aria-label="Reproducir"></button>
                        <button type="button" class="chico" data-vel aria-label="Velocidad">1×</button>
                        <button type="button" class="chico" data-final>Ir al final</button>
                    </div>
                    <div class="pulso" role="slider" tabindex="0" aria-label="Día del mes" aria-valuemin="1" aria-valuemax="30" aria-valuenow="1">
                        <div class="columnas"></div>
                        <div class="cabezal"><span></span></div>
                        <div class="dias"></div>
                    </div>
                    <p class="leyenda">Puntos de la unidad por día · arrastra para moverte</p>
                </div>
            </div>
        </section>

        <!-- 3. El podio y cómo llegó cada una -->
        <section class="podio" id="podio" aria-labelledby="podio-t">
            <p class="kicker">Así cerró <span class="mes"></span></p>
            <h2 id="podio-t">El podio y cómo lo ganaron</h2>
            <div class="tres"></div>
        </section>

        <!-- 3b. Estrellas del trimestre -->
        <section class="estrellas" id="estrellas" aria-labelledby="est-t">
            <header class="cab revela"><p class="kicker">Estrellas del trimestre · <span class="trimestre"></span></p><h2 id="est-t">Las Consultoras Estrella</h2><p class="sub"></p></header>
            <div class="joyero revela"></div>
            <div class="joyas"></div>
        </section>

        <!-- 4. Nivel de descuento (y sus corazones): quién subió y cuándo -->
        <section class="clubes" id="descuento" aria-labelledby="desc-t">
            <header class="cab revela"><p class="kicker">Nivel de descuento</p><h2 id="desc-t">Quién subió de descuento y cuándo</h2><p class="sub"></p></header>
            <div class="escala revela">
                <div class="reloj-c">
                    <button type="button" class="play" data-play-c aria-label="Reproducir la escalera"></button>
                    <div class="dia-c"><small class="semana-c"></small><b><span class="n">1</span> <span class="de">de <span class="mes"></span></span></b></div>
                    <input class="rango" type="range" min="1" max="30" value="1" aria-label="Día del mes">
                    <p class="subidas" aria-live="polite"></p>
                </div>
                <div class="peldanos"></div>
                <div class="globo" hidden></div>
            </div>
        </section>

        <!-- 5. Círculo Rosa -->
        <section class="circulo" id="circulo-rosa" aria-labelledby="cr-t">
            <header class="cab revela"><p class="kicker">Círculo Rosa</p><h2 id="cr-t">La constancia de tu unidad</h2><p class="sub"></p></header>
            <div class="cr-cifras revela"></div>
            <div class="cr-hitos"></div>
            <div class="cr-listas revela"></div>
            <div class="cr-entraron revela"></div>
        </section>

        <!-- 6. El mes, día por día -->
        <section class="calendario" id="dia-por-dia" aria-labelledby="cal-t">
            <header class="cab revela"><p class="kicker">El mes, día por día</p><h2 id="cal-t">Quién ordenó y cuándo</h2><p class="sub"></p></header>
            <div class="cal-cuerpo revela">
                <div class="cal"><div class="sem-cab" aria-hidden="true"></div><div class="celdas"></div></div>
                <aside class="detalle" aria-live="polite"></aside>
            </div>
        </section>

        <!-- 6b. Tempraneras: opcional, la Directora la enciende y elige hasta qué día cuenta -->
        <section class="tempraneras" id="tempraneras" aria-labelledby="tem-t" hidden>
            <header class="cab revela"><p class="kicker">Tempraneras</p><h2 id="tem-t">Las que ordenaron primero</h2><p class="sub"></p></header>
            <div class="madrugada revela"></div>
            <div class="tempranas"></div>
        </section>

        <!-- 7. Iniciadoras y Nuevos Inicios -->
        <section class="llegadas" id="iniciadoras" aria-labelledby="lleg-t">
            <header class="cab revela"><p class="kicker">Iniciadoras</p><h2 id="lleg-t">Quién trajo a quién</h2><p class="sub"></p></header>
            <div class="pares"></div>
            <h3 class="subtit revela" data-previas hidden>Su primer mes completo</h3>
            <div class="tarjetas"></div>
        </section>

        <!-- 7b. Camino al Éxito -->
        <section class="camino-ex" id="camino" aria-labelledby="cam-t">
            <header class="cab revela"><p class="kicker">Camino al Éxito</p><h2 id="cam-t">Rumbo a Directora</h2><p class="sub"></p></header>
            <div class="ruta revela"></div>
            <div class="etapas"></div>
        </section>

        <!-- 8. Productos -->
        <section class="productos" id="productos" aria-labelledby="prod-t">
            <header class="cab revela"><p class="kicker">Productos del mes</p><h2 id="prod-t">Lo que más pidió tu unidad</h2><p class="sub"></p></header>
            <div class="vitrina"></div>
            <div class="ordena revela"></div>
        </section>

        <!-- 9. Cumpleaños del mes en curso -->
        <section class="fiesta" id="cumpleanos" aria-labelledby="cum-t">
            <header class="cab revela"><p class="kicker">Cumpleaños de <span class="mes-curso"></span></p><h2 id="cum-t">Las que celebran este mes</h2><p class="sub"></p></header>
            <div class="cinta revela" aria-hidden="true"></div>
            <div class="pasteles"></div>
        </section>

        <!-- 10. Aniversarios del mes en curso -->
        <section class="fiesta aniv" id="aniversarios" aria-labelledby="ani-t">
            <header class="cab revela"><p class="kicker">Aniversarios de <span class="mes-curso"></span></p><h2 id="ani-t">Años de ser Mary Kay</h2><p class="sub"></p></header>
            <div class="linea-anios revela"></div>
            <div class="anios"></div>
        </section>

        <section class="cierre">
            <figure class="firma">
                <div class="ovalo-f"></div>
                <figcaption><p class="mensaje-d" hidden></p><b class="dire-nombre"></b><span class="dire-nivel"></span></figcaption>
            </figure>
            <img src="${base}/honor_mk.webp" alt="Mary Kay" width="420" height="68">
            <p>Cada orden movió la carrera. <b>Octubre ya empezó.</b></p>
            <button type="button" class="chico" data-otra>Ver la carrera otra vez</button>
        </section>
    </main>

    <nav class="hud-junta" aria-label="Modo junta" hidden>
        <button type="button" data-j-ant aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="j-txt"><b></b><small></small></span>
        <button type="button" data-j-sig aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        <button type="button" class="j-salir" data-j-salir>Salir</button>
    </nav>
</div>`
}
