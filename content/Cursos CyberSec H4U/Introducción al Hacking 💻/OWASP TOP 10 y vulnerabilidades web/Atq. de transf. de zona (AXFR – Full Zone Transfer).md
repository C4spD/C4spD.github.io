----
- Tags: #dominios #vulnerabilidades 
----
# Definición

> Los ataques de transferencia de zona, también conocidos como ataques **AXFR**, son un tipo de ataque que se dirige a los servidores **DNS** (**Domain Name System**) y que permite a los atacantes obtener información sensible sobre los dominios de una organización.

En términos simples, los servidores DNS se encargan de traducir los nombres de dominio legibles por humanos en direcciones IP utilizables por las máquinas. Los ataques AXFR permiten a los atacantes obtener información sobre los registros DNS almacenados en un servidor DNS.

El ataque AXFR se lleva a cabo enviando una solicitud de transferencia de zona desde un servidor DNS falso a un servidor DNS legítimo. Esta solicitud se realiza utilizando el protocolo de transferencia de zona DNS (AXFR), que es utilizado por los servidores DNS para transferir registros DNS de un servidor a otro.

Si el servidor DNS legítimo no está configurado correctamente, puede responder a la solicitud de transferencia de zona y proporcionar al atacante información detallada sobre los registros DNS almacenados en el servidor. Esto incluye información como los nombres de dominio, direcciones IP, servidores de correo electrónico y otra información sensible que puede ser utilizada en futuros ataques.

Una de las herramientas que utilizamos en esta clase para explotar el AXFR es **dig**. El comando dig es una herramienta de línea de comandos que se utiliza para realizar consultas DNS y obtener información sobre los registros DNS de un dominio específico.

La sintaxis para aplicar el AXFR en un servidor DNS es la siguiente:

- `dig @<DNS-server> <domain-name> AXFR`

Donde:

- ``<DNS-server>`` es la dirección IP del servidor DNS que se desea consultar.
- ``<domain-name>`` es el nombre de dominio del cual se desea obtener la transferencia de zona.
- ``AXFR`` es el tipo de consulta que se desea realizar, que indica al servidor DNS que se desea una transferencia de zona completa.

Para prevenir los ataques AXFR, es importante que los administradores de red configuren adecuadamente los servidores DNS y limiten el acceso a la transferencia de zona solo a servidores autorizados. También es importante mantener actualizado el software del servidor DNS y utilizar técnicas de cifrado y autenticación fuertes para proteger los datos que se transmiten a través de la red. Los administradores también pueden utilizar herramientas de monitoreo de DNS para detectar y prevenir posibles ataques de transferencia de zona.

------
# Explotación en Laboratorio

Comenzaremos desplegando el laboratorio a través del siguiente [repositorio](https://github.com/vulhub/vulhub/tree/master/dns/dns-zone-transfer)

- ``curl -L https://codeload.github.com/vulhub/vulhub/tar.gz/master | tar -xz --strip=2 vulhub-master/dns/dns-zone-transfer``

Una vez estemos en el directorio del laboratorio modificaremos a modo de ejemplo el archivo *named.conf.local* en su primer linea, donde pone *vulhub.org* pondremos por ejemplo *c4spcorp.com*.

- ``docker-compose up -d``

Si miramos el archivo *vulhub.db* veremos información detallada del servidor web, como sus sub dominios a que IPs resuelven, alias que se conectan a los subdominios y demás.

![[ATDZ 1.png]]

Una vez que entendemos la información que conseguiremos al emplear el ataque, comencemos con el mismo.

- ``dig axfr @127.0.0.1 c4spcorp.com``

![[ATDZ 2.png]]

De esta forma obtendríamos toda la información acerca de subdominios y demás.