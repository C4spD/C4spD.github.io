----
- Tags: #owasp #vulnerabilidades #web 
----
# Definición

> El "**Prototype Pollution**" es una vulnerabilidad en la seguridad de aplicaciones que afecta a cómo se manipulan y manejan los objetos en lenguajes de programación como **JavaScript**. Esta vulnerabilidad permite que un atacante **modifique el prototipo de un objeto global**, lo cual puede tener consecuencias graves en la aplicación.

En JavaScript, los objetos tienen una estructura de prototipos. Cada objeto puede heredar propiedades y métodos de su prototipo. Si un atacante puede manipular el prototipo de un objeto global (como `Object.prototype`), puede introducir o modificar propiedades en todos los objetos que heredan de ese prototipo. Esto puede llevar a una serie de problemas, como:

- **Ejecución de código no autorizado**: El atacante podría añadir propiedades o métodos que permitan la ejecución de código malicioso.
- **Manipulación de datos**: Modificar los datos procesados por la aplicación, lo que puede llevar a errores o comportamientos inesperados.
- **Bypass de controles de seguridad**: Alterar o eludir controles de seguridad que dependen de la estructura o contenido de los objetos.

Por ejemplo, si un atacante puede añadir una propiedad llamada `isAdmin` al prototipo de los objetos, podría forzar a la aplicación a tratar a ciertos usuarios como administradores, incluso si no deberían tener esos permisos.

Para prevenir el Prototype Pollution, es importante validar y sanitizar adecuadamente cualquier entrada que pueda afectar a los objetos globales y evitar el uso de métodos que permitan la manipulación directa del prototipo de objetos sin control.

-----
# Laboratorio y conceptos básicos

Para esta vulnerabilidad montaremos un laboratorio proveniente de este [repositorio](https://github.com/blabla1337/skf-labs) de Github que ya habíamos utilizado previamente en otras vulnerabilidades.

- ``git clone https://github.com/blabla1337/skf-labs``
- ``cd skf-labs/nodejs/Prototype-Pollution``
- ``npm install``
- ``npm start``

Una vez hecho todo lo anterior tendremos nuestro laboratorio corriendo por el *puerto 5000*.
Procederemos a **registrarnos** en la web ``c4sp:c4sp123``. 
Ahora antes de realizar la explotación vamos a explicar unos **conceptos básicos** con respecto a los **Objetos** y **Prototypes** en la programación de **Javascript**.

- **Prototipos** son objetos de los cuales otros objetos heredan propiedades y métodos.
- **Herencia** permite que un objeto herede y use propiedades y métodos del prototipo.
- **Prototype Pollution** ocurre cuando un atacante modifica el prototipo para introducir o cambiar propiedades globalmente, afectando a todos los objetos que heredan de él.

-----

- **Objetos en JavaScript**:

	- Un objeto es una colección de propiedades, donde cada propiedad tiene un nombre (clave) y un valor.

```js
let persona = {
  nombre: "Juan",
  edad: 30
};
```

------

- **Prototipos**:
    
    - En JavaScript, cada objeto tiene una propiedad interna llamada "prototipo" (accesible a través de `__proto__` en versiones antiguas de JavaScript o `Object.getPrototypeOf(obj)` en versiones más nuevas).
    - El prototipo es otro objeto que actúa como una plantilla. Los objetos heredan propiedades y métodos de su prototipo.
    - Ejemplo: Si tienes un objeto `animal`, puedes tener un prototipo que defina métodos como `hacerSonido`. Cualquier objeto que herede de este prototipo tendrá acceso a `hacerSonido`.

----

- **Herencia**:
    
    - Cuando un objeto hereda de otro, utiliza el prototipo del objeto padre. Es decir, el objeto hijo tiene acceso a todas las propiedades y métodos definidos en el prototipo del objeto padre.

```js
// Definir un prototipo
let animal = {
  hacerSonido: function() {
    console.log("Haciendo sonido...");
  }
};

// Crear un objeto que hereda del prototipo 'animal'
let perro = Object.create(animal);
perro.nombre = "Fido";
perro.hacerSonido();  // Imprime: Haciendo sonido...
```

**Prototipo del Objeto**:

- En el ejemplo anterior, `perro` hereda del prototipo `animal`. Cuando llamamos `perro.hacerSonido()`, JavaScript busca el método `hacerSonido` en `perro`. Como no lo encuentra directamente en `perro`, busca en su prototipo `animal`.

----
# Explicación en profundidad con Explotación
## Explicación con ejemplos

Nuestra idea como atacantes es elevar nuestro privilegio a través de un **Prototype Pollution**.

Una vez estemos registrados en la web veremos lo siguiente.

![[Proto 1.png]]

Veremos que en donde pone "*Admin:*" no hay nada, por lo tanto nos da a entender que **no somos administradores**, luego en la parte inferior tenemos un panel que nos permite enviarle un mensaje a un administrador, por lo tanto interceptemos con **Burpsuite** la petición.

Si nosotros observamos el archivo *index.js* dentro del directorio donde desplegamos el laboratorio, veremos una sección particular

![[Proto 2.png]]

Esta es un array de dos objetos, uno "*admin*" y el otro "*user*", como podemos notar hay una propiedad que diferencia a los dos objetos entre si, y es la propiedad ``admin: true`` del usuario **admin** que en el caso de **user** se encuentra en ``false``.
Si miramos mas abajo en el código veremos la sección de ``/message`` que representa al panel de envío de mensajes de la web.

![[Proto 3.png]]

En esta sección se aplica un ``_.merge()`` entre la solicitud que enviamos por **POST** ``req.body``, es decir el cuerpo de la solicitud y el ``{ ipAddress: req.ip } ``.

---

Lo que haremos para entender bien como funciona todo esto es agregarle la línea ``console.log(obj);`` para que nos muestre por la terminal que es lo que está haciendo y que está almacenando como objeto.

![[Proto 4.png]]

Ahora haremos un ``npm start`` (cerrando obviamente la anterior ejecución) y nos volveremos a registrar y luego **le enviaremos nuevamente un mensaje al administrador** para ver que nos muestra por consola.

![[Proto 5.png]]

Como podemos ver **almacena los datos que enviamos** incluyendo nuestra IP. El ``merge()`` está combinando **nuestro cuerpo (correo y mensaje)** de solicitud que por POST hemos tramitado a través del panel de mensaje y el **ipAddress**, está fusionando ambas cosas. Esta es una práctica muy común que se suele hacer, pero esto puede traer sus consecuencias.

Haremos mediante el uso de una **consola online de Javascript** una breve explicación de como funciona esto, y que consecuencias puede traer. Nos apoyaremos del siguiente [blog](https://medium.com/node-modules/what-is-prototype-pollution-and-why-is-it-such-a-big-deal-2dd8d89a93c) que toca el tema de Prototype Pollution, ya que de este utilizaremos un código brindado para nuestro ejemplo.

Código del blog que utilizaremos:

==Debemos eliminar la tercer linea, que evita el uso de la propiedad ``__proto__``==

```js
var merge = function(target, source) {
    for(var attr in source) {
        if(attr === "__proto__") continue; // Do not merge the property if it's name is __proto__
        if(typeof(target[attr]) === "object" && typeof(source[attr]) === "object") {
            merge(target[attr], source[attr]);
        } else {
            target[attr] = source[attr];
        }
    }
    return target;
};
```

---

Recordemos que nuestro **cuerpo de la solicitud** que nosotros tramitamos por POST es **nuestro email** y **nuestro mensaje**, por lo tanto debajo de ese código colocaremos esto 

- ``var body = JSON.parse('{"email": "test@test.com", "msg": "testing"}');``

Ahora representaremos el ``merge()`` donde se fusione el ``ipAddress`` como lo vimos en el *index.js* (esta vez ya le daremos un valor fijo que será "*127.0.0.1*") con nuestro cuerpo de la solicitud.

- ``console.log(merge({"ipAddress": "127.0.0.1"}, body));``

![[Proto 6.png]]

Ahora creemos dos objetos diferentes por encima de ambas líneas, uno será ``var c4sp = {}`` y otro será ``var admin = {}`` a los que le meteremos propiedades.

```js
var c4sp = {"name": "Santiago", "age": 23}
var admin = {"name": "Jose", "age": 57, "isAdmin": true}
```

Para el usuario **c4sp** no se ha especificado si es admin o no por ahora.

Para poder entenderlo mejor añadiremos una línea al final del todo que dirá esto ``console.log("¿El usuario admin es administrador? --> " + admin.isAdmin);`` esto dará **True**, pero si cambiamos ``admin.isAdmin`` por ``c4sp.isAdmin`` nos dirá **Undefined** porque el usuario *c4sp* **no tiene esa propiedad definida**.

![[Proto 7.png]]

En este momento entra el juego el uso del **Prototipo** ``__proto__``, ya que normalmente cuando una propiedad **no existe** para un **objeto dado** lo que hace es **mirar por su Prototipo** que es de donde hereda ciertas propiedades en caso de que el objeto no las tenga. 
Como nosotros el campo ``body`` es algo que podemos controlar, con **Burpsuite** podríamos **manipular** la petición de estos datos que enviamos como cuerpo para **incorporar una nuevo campo**, que en este caso será el campo ``__proto__`` el cual valdrá ``{"isAdmin": True}`` quedando todo tal que así.

- ``var body = JSON.parse('{"email": "test@test.com", "msg": "testing", "__proto__": {"isAdmin": true}}');``

Si no estuviera sanitizado y nosotros pudiéramos **incorporar** este nuevo campo ``__proto__`` y hacer que este **Prototipo** tenga la propiedad ``isAdmin`` setteada a **True**, de cara a todos los objetos que estén contemplados/creados que **no contengan esta propiedad**, cuando por ejemplo para un usuario dado o un objeto dado se intente representar la propiedad ``isAdmin`` y este no la contenga, mirará al prototipo y **la heredará desde ahí**, de esta manera se contaminaría.

![[Proto 8.png]]

De esta forma el usuario **c4sp** y todos los demás usuarios en este caso poseerían la propiedad del usuario admin por **herencia**.
Nosotros en **un caso real** deberíamos hacer **fuzzing** para conseguir encontrar **el nombre de la propiedad que corresponde al usuario privilegiado**, ya que no siempre su nombre es ``isAdmin``.

Para sanitizar esto, simplemente deberíamos contemplar que no se pueda utilizar la propiedad ``__proto__`` de esta forma ``if(attr === "__proto__") continue; // Do not merge the property if it's name is __proto__``

----

Un ejemplo mas claro y más sencillo de entender sería el siguiente

![[Proto 9.png]]

Pero si nosotros no definiéramos la altura de "**admin**" y le agregamos la propiedad ``__proto__`` a la altura de "**c4sp**", cualquier usuario que exista, **tendrá la altura de c4sp ya que la heredará**.

![[Proto 10.png]]

-----
## Explotación

Trasladado a la web del laboratorio deberíamos hacer algo similar a través de **Burpsuite** manipulado la petición.

![[Proto 11.png]]

Como vimos ahí, la **petición por defecto** da un *302 Found*, por lo tanto tenemos que conseguir ese mismo código cuando efectuemos el ataque.
Ahora debemos hacer ``CTRL+SHIFT+U`` para quitar el **URLENCODE** del cuerpo que estamos enviando, luego para poder generar el ataque como vimos en los ejemplos anteriores, debemos hacer una petición en **formato JSON**, por lo tanto cambiaremos el *Content-Type* y también la forma en la que enviamos **el cuerpo adaptada a JSON**.

![[Proto 12.png]]

Como vimos antes en la web, hay un campo *Admin:* que no posee información, por lo tanto tenemos el indicio de que **así se llama la propiedad que posee el usuario Administrador**, por lo tanto ahora cuando nosotros agreguemos el campo ``__proto__`` este valdrá ``{"admin": true}``.

![[Proto 13.png]]

Si quisiéramos verlo mejor o en una línea sola podríamos manipularlo en formato **Raw**.

![[Proto 14.png]]

--------

Por ultimo solo restaría en reiniciar la web ``F5``, y ver como está el estado de "*Admin:*"

![[Proto 15.png]]

Recordemos que nosotros en **un caso real** deberíamos hacer **fuzzing** para conseguir encontrar **el nombre de la propiedad que corresponde al usuario privilegiado**, ya que no siempre su nombre es como el de los ejemplos, además si llegáramos a poder ver **el código fuente de la web** podríamos tener mas **pistas** sobre su nombre.