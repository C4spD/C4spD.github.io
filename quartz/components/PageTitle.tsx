import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)

  return (
    <div class={classNames(displayClass, "page-title-container")}>
      <h2 class="page-title">
        <a href={baseDir}>{title}</a>
      </h2>
      <img 
        src="/Imagenes-todo/DANDADAN.png" 
        alt="Mi CV" 
        class="page-title-image"
      />
    </div>
  )
}

PageTitle.css = `
.page-title-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
}

.page-title-image {
  margin-top: 10px;
  width: 200px; /* Ajusta el tamaño */
  height: auto; /* Mantiene la proporción */
  border-radius: 10px; /* Opcional: Bordes redondeados */
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
