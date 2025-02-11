------
- Tags: #atributos #ficheros 
---------
# Definición

Una Capabilitie hace referencia a **una capacidad o privilegio asignado previamente a un binario** en [[Linux]], por ejemplo para **tener cierta capacidad o para poder ejecutar cierta tarea privilegiada**.

-------
# Listado y definiciones de Capabilities

Para poder listar las capabilities del sistema utilizamos el siguiente comando
***``getcap (ruta absoluta)``*** o también podemos listar todo lo del sistema con
**``getcap -r / 2>/dev/null``** utilizamos el **``-r``** de recursivo mas el **``/``** para poder abarcar a partir de la raíz, y **``2>``** que es la **redirección de STDERR** porque **como usuario no privilegiado hay ciertas rutas a las que no vamos a tener acceso**.

Con el comando anterior **veremos las capabilities que nosotros previamente tenemos que configurar a determinados binarios** para poder ejecutar ciertas tareas, privilegiadas o lo que corresponda, **además de binarios con capabilities ya establecidas por defecto**.

Para poder **asignar una capabilitie a un binario utilizamos**. ==Como root==

**``setcap cap_setuid+ep /usr/bin/python3.9``** <---- (Directorio al que le queremos asignar la capabilitie) 

Hay diferentes tipos de **Capabilities** nosotros **asignamos** con el **``CMD``** anterior el **permiso de controlar el identificador de usuario**.

Lo chequeamos con **``getcap !$``** para ver el directorio previamente escrito **``/usr/bin/python3.9``**

Para quitársela usamos **``setcap -r /usr/bin/python3.9``**

Para mas información podemos visitar la [Web de Capabilities existentes](https://www.etl.it.uc3m.es/Linux_Capabilities)

Hasta la versión 2.4.18 de Linux, **las siguientes capacidades están implementadas**:

      CAP_CHOWN
             Permite cambios arbitrarios en los IDs de usuario y de grupo  de
             los ficheros (vea chown(2)).

      CAP_DAC_OVERRIDE
             Evita  las  comprobaciones de permisos sobre operaciones de lec-
             tura, escritura y ejecución.  (DAC = "control de acceso  discre-
             cional".)

      CAP_DAC_READ_SEARCH
             Evita comprobaciones de permisos sobre operaciones de lectura de
             ficheros y lectura y ejecución de directorios.

      CAP_FOWNER
             Evita comprobaciones de permisos sobre operaciones  que  normal-
             mente requieren que el ID de usuario del sistema de ficheros del
             proceso coincida  con  el  ID  de  usuario  del  fichero  (p.e.,
             utime(2)),   excluyendo   aquellas   operaciones  cubiertas  por
             CAP_DAC_OVERRIDE y CAP_DAC_READ_SEARCH; ignora el  bit  pegajoso
             (sticky) en el borrado de ficheros.

      CAP_FSETID
             No  borra los bits set-user-ID y set-group-ID cuando se modifica
             un fichero; permite  establecer  el  bit  set-group-ID  para  un
             fichero  cuyo  ID  de  grupo  no  coincide con el del sistema de
             ficheros o cualquier otro ID  de  grupo  adicional  del  proceso
             invocador.

      CAP_IPC_LOCK
             Permite  el  bloqueo  en  memoria  (mlock(2),  mlockall(2), shm-
             ctl(2)).

      CAP_IPC_OWNER
             Evita comprobaciones de  permisos  para  las  operaciones  sobre
             objetos System V IPC.

      CAP_KILL
             Evita  comprobaciones  de  permisos  para  enviar  señales  (vea
             kill(2)).

      CAP_LEASE
             (Linux 2.4 en adelante)  Permite que  se  establezcan  arriendos
             sobre ficheros arbitrarios (vea fcntl(2)).

      CAP_LINUX_IMMUTABLE
             Permite  establecer  los  atributos  extendidos EXT2_APPEND_FL y
             EXT2_IMMUTABLE_FL sobre ficheros del sistema de ficheros ext2.

      CAP_MKNOD
             (Linux 2.4 en adelante) Permite la creación  de  ficheros  espe-
             ciales usando mknod(2).

      CAP_NET_ADMIN
             Permite   varias   operaciones  relacionadas  con  redes  (p.e.,
             establecer opciones privilegiadas sobre conectores, habilitar la
             difusión  de paquetes multidestino (multicasting), configuración
             de interfaces, modificar tablas de encaminamiento).

      CAP_NET_BIND_SERVICE
             Permite ligar conectores a puertos  reservados  del  dominio  de
             Internet (números de puerto menores que 1024).

      CAP_NET_BROADCAST
             (No  se  usa)  Permite  la  difusión universal (broadcasting) de
             paquetes a través de un conector y la escucha de paquetes multi-
             destino.

      CAP_NET_RAW
             Permite el uso de conectores de tipo RAW y PACKET.

      CAP_SETGID
             Permite  manipulaciones  arbitrarias de los IDs de grupo y de la
             lista de IDs de grupo adicionales de un proceso; permite el  uso
             de  IDs  de  grupo  falsificados cuando se pasan credenciales de
             conectores a través de conectores de dominio Unix.

      CAP_SETPCAP
             Concede o elimina cualquier capacidad en el conjunto de  capaci-
             dades permitidas del invocador a o desde cualquier otro proceso.

      CAP_SETUID
             Permite  manipulaciones arbitrarias de los IDs de usuario de los
             procesos (setuid(2), etc.); permite el uso  de  IDs  de  usuario
             falsificados cuando se pasan credenciales de conectores a través
             de conectores de dominio Unix.

      CAP_SYS_ADMIN
             Permite una variedad de operaciones de administración  del  sis-
             tema  incluyendo:  quotactl(2),  mount(2),  swapon(2),  sethost-
             name(2), setdomainname(2), IPC_SET y operaciones IPC_RMID  sobre
             objetos  arbitrarios  IPC  de System V; permite el uso de IDs de
             usuario falsificados cuando se pasan credenciales de conectores.

      CAP_SYS_BOOT
             Permite llamadas a reboot(2).

      CAP_SYS_CHROOT
             Permite llamadas a chroot(2).

      CAP_SYS_MODULE
             Permite cargar y eliminar módulos del núcleo.

      CAP_SYS_NICE
             Permite aumentar el valor nice del proceso  invocador  (nice(2),
             setpriority(2)) y cambiar el valor nice de procesos arbitrarios;
             permite establecer políticas de  planificación  de  tiempo  real
             para  el  proceso  invocador  y establecer políticas de planifi-
             cación y prioridades para procesos arbitrarios  (sched_setsched-
             uler(2), sched_setparam(2)).

      CAP_SYS_PACCT
             Permite llamadas a acct(2).

      CAP_SYS_PTRACE
             Permite  el seguimiento detallado de procesos arbitrarios usando
             ptrace(2)

      CAP_SYS_RAWIO
             Permite operaciones sobre puertos de E/S (iopl(2) y ioperm(2)).

      CAP_SYS_RESOURCE
             Permite el uso de espacio  reservado  en  sistemas  de  ficheros
             ext2;  llamadas  ioctl(2)  para  controlar  el registro en ext3;
             sobrescribir los límites de las cuotas de disco; incrementar los
             límites  de  recursos (vea setrlimit(2)); sobrescribir el límite
             del recurso RLIMIT_NPROC; incrementar el límite msg_qbytes  para
             una  cola  de  mensajes  por encima del limite en /proc/sys/ker-
             nel/msgmnb (vea msgop(2) y msgctl(2).

      CAP_SYS_TIME
             Permite la modificación del reloj del sistema  (settimeofday(2),
             adjtimex(2));  permite  la modificación del reloj de tiempo real
             (hardware)

      CAP_SYS_TTY_CONFIG
             Permite llamadas a vhangup(2).