-----
- Tags: #vulnerabilidades #xss 
------
# Definición

> El **Client-Side Template Injection** (**CSTI**) es una vulnerabilidad de seguridad en la que un atacante puede inyectar código malicioso en una **plantilla de cliente**, que se ejecuta en el **navegador** del usuario en lugar del servidor.

A diferencia del **Server-Side Template Injection** (**SSTI**), en el que la plantilla de servidor se ejecuta en el servidor y es responsable de generar el contenido dinámico, en el **CSTI**, la plantilla de cliente se ejecuta en el navegador del usuario y se utiliza para generar contenido dinámico en el lado del cliente.

Por ejemplo, imagina que una aplicación web utiliza plantillas de cliente para generar contenido dinámico. Un atacante podría aprovechar una vulnerabilidad de **CSTI** para inyectar código malicioso en la plantilla de cliente, lo que permitiría al atacante **ejecutar comandos en el navegador del usuario y obtener acceso no autorizado** a los datos sensibles de la aplicación web.

Una derivación común en un ataque de **Client-Side Template Injection** (**CSTI**) es aprovecharlo para realizar un ataque de **Cross-Site Scripting** (**XSS**).

Una vez que un atacante ha inyectado código malicioso en la plantilla de cliente, puede manipular los datos que se muestran al usuario, lo que le permite **ejecutar código JavaScript en el navegador del usuario**. A través de este código malicioso, **el atacante puede intentar robar la cookie de sesión del usuario**, lo que le permitiría obtener acceso no autorizado a la cuenta del usuario y realizar acciones maliciosas en su nombre.

Para prevenir los ataques de CSTI, los desarrolladores de aplicaciones web deben validar y filtrar adecuadamente la entrada del usuario y utilizar herramientas y frameworks de plantillas seguros que implementen medidas de seguridad para prevenir la inyección de código malicioso.

# Explotación de CSTI en Laboratorio

Comenzaremos montando un contenedor de la siguiente manera

- ``git clone https://github.com/blabla1337/skf-labs``

Ingresamos en el directorio */python/CSTI* y con ``pip2`` hacemos un ``pip2 install -r requirements.txt`` y un ``python2 CSTI.py`` para montar un servidor por el *puerto 5000*, luego entramos a la web al servicio corriendo por el puerto 5000.

----

En la web dispondremos de un espacio en el que **podemos colocar datos a gusto**, cuando lo hacemos veremos que **se ve reflejado el input nuestro como output en la web**, ahí es donde podremos aprovechar verificar si es vulnerable a un **CSTI** de la misma forma que lo hicimos con el [[SSTI (Server-Side Template Injection)]], colocando por ejemplo una operatoria ``{{4*4}}``.

![[CSTI 1.png]]

Hay que entender que a efectos prácticos la manera de testear si una web es vulnerable a un **Template Injection** es igual tanto para **CSTI** como para **SSTI**. 
Lo que si veremos de diferente en este caso es que si **intentamos cargar archivos internos de la máquina o tratamos de ejecutar comandos como lo hicimos en SSTI** no vamos a poder, porque no es del lado del servidor que se manipula esta plantilla, es del lado del cliente.

Si nosotros ahora hacemos un ``CTRL+U`` para **ver el código fuente de la web**, en una sección veremos ``angularjs/1.5.0``, esto es una pista para saber que versión posee este.

Procedemos a buscar en algún motor de búsquedas *angularjs 1.5.0 CSTI* y en nuestro caso encontramos un [Repositorio](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSS%20Injection/XSS%20in%20Angular.md) en una sección de *PayloadsAllTheThings*, en nuestro caso nos sirvió este Payload un poco extenso.

![[CSTI 2.png]]

![[CSTI 3.png]]

Hay que tener en cuenta que **para nosotros poder modificar** el campo de ``alert(1)``, debemos hacer un pequeño **Bypass**, ya que si ahí colocamos por ejemplo ``alert("PWNED")`` no aparecerá la alerta debido a que hay algunos casos en los que no podremos utilizar ciertos caracteres especiales o letras porque se encuentra sanitizado por defecto, para burlar esto haremos lo siguiente.

- ``String.fromCharCode()`` esta expresión permite colocar caracteres en DECIMAL y representarlos en texto plano

Si nos dirigimos a la web y hacemos un ``CTRL+SHIFT+C`` y nos dirigimos a *Console* haciendo un ``clear()`` para limpiar el contenido, podremos utilizar la expresión anterior para probarla.

![[CSTI 4.png]]

Por lo tanto si quisiéramos poner la cadena "*PWNED*" deberíamos colocar su equivalencia pero en decimal separado por ``,``.

Para hacer esto de una forma rápida podemos abrir ``python3`` y crear una variable llamada **sentence**, para luego iterar por cada carácter y aplicarle un ``ord()`` para pasarlo a **Hexadecimal**.

![[CSTI 5.png]]

Copiamos todo el resultado y hacemos un ``echo "80 87 78 69 68" | xargs | sed "s/ /,/g"`` para quitarle con ``xargs`` los saltos de linea y luego con ``sed`` reemplazar los espacios por ``,``.

Ahora solo restaría meter el código de *PayloadsAllTheThings* en un archivo, y modificarlo en donde pone "*1*" en  ``alert(1)`` con el ``(String.fromCharCode(80,87,78,69,68)``.

```js
{{
    c=''.sub.call;b=''.sub.bind;a=''.sub.apply;
    c.$apply=$apply;c.$eval=b;op=$root.$$phase;
    $root.$$phase=null;od=$root.$digest;$root.$digest=({}).toString;
    C=c.$apply(c);$root.$$phase=op;$root.$digest=od;
    B=C(b,c,b);$evalAsync("
    astNode=pop();astNode.type='UnaryExpression';
    astNode.operator='(window.X?void0:(window.X=true,alert(String.fromCharCode(80,87,78,69,68))))+'; // ---------------------------> Acá está la modificación con el "String.fromCharMode()" aplicado.
    astNode.argument={type:'Identifier',name:'foo'};
    ");
    m1=B($$asyncQueue.pop().expression,null,$root);
    m2=B(C,null,m1);[].push.apply=m2;a=''.sub;
    $eval('a(b.c)');[].push.apply=a;
}}
```

![[CSTI 6.png]]

A partir de ahora, siguiendo con todo lo visto **podríamos** efectuar el [[XSS (Cross-site Scripting)]] realizando lo que nos apetezca.

