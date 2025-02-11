--------
- Tags: #burpsuite #network #vulnerabilidades #proxy #web 
-----
# Definición

> **BurpSuite** es una herramienta de prueba de penetración utilizada para encontrar vulnerabilidades de seguridad en aplicaciones web. **BurpSuite** se compone de **varias herramientas diferentes** que se pueden utilizar juntas para **identificar vulnerabilidades** en una **aplicación web**.

Las principales herramientas que componen BurpSuite son las siguientes:

- **Proxy**: Es la **herramienta principal** de **BurpSuite** y actúa como un **intermediario entre el navegador web y el servidor web**. Esto permite a los usuarios **interceptar y modificar las solicitudes y respuestas HTTP y HTTPS enviadas** entre el navegador y el servidor. El **Proxy** también es útil para la **identificación de vulnerabilidades**, ya que permite a los usuarios examinar el tráfico y analizar las solicitudes y respuestas.
- **Scanner**: Es una herramienta de **prueba de vulnerabilidades automatizada** que se utiliza para **identificar vulnerabilidades en aplicaciones web**. El Scanner utiliza técnicas de exploración avanzadas para detectar vulnerabilidades en la aplicación web, como inyecciones SQL, cross-site scripting (XSS), vulnerabilidades de seguridad de la capa de aplicación (OSWAP Top 10) y más.
- **Repeater**: Es una herramienta que **permite a los usuarios reenviar y repetir solicitudes HTTP y HTTPS**. Esto es útil para **probar diferentes entradas y verificar la respuesta del servidor**. También es útil para la identificación de vulnerabilidades, ya que permite a los usuarios probar diferentes valores y detectar respuestas inesperadas.
- **Intruder**: Es una herramienta que se utiliza para **automatizar ataques de fuerza bruta**. Los usuarios pueden definir diferentes **payloads** para diferentes partes de la solicitud, como la URL, el cuerpo de la solicitud y las cabeceras. Posteriormente, Intruder automatiza la ejecución de las solicitudes utilizando diferentes payloads y los usuarios pueden examinar las respuestas para identificar vulnerabilidades.
- **Comparer**: Es una herramienta que se utiliza **para comparar dos solicitudes HTTP o HTTPS**. Esto es útil para detectar diferencias entre las solicitudes y respuestas y analizar la seguridad de la aplicación.

--------
# Definir nuestro alcance de dominios

Si ingresamos a **Target**, en la sección de **Site map** nos aparecerán variedades de dominios que **no van a corresponder a lo que nosotros queremos auditar**, esto se debe a que no estamos definiendo nuestro **alcance**, esto es importante definirlo para que de cara a las peticiones que interceptes, no te figuren en la sección de Site Map las que **no te interesen**.
Para poder definir nuestro alcance, debemos ingresar al apartado de **Scope Settings** dentro de **Site Map**, y añadir en **Include in Scope** el o los dominios que queramos ver **únicamente**.
