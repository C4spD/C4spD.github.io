import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
		Created by <a href="https://www.linkedin.com/in/santiago-piñeiro-camilletti/" target="_blank" rel="noopener noreferrer">C4sp</a> © {year}
        </p>
	  <ul>
	    <li><a href="https://github.com/C4spD">GitHub</a></li>
	    <li><a href="https://discord.com/users/c4sp01">Discord</a></li>
	    <li><a href="https://www.linkedin.com/in/santiago-piñeiro-camilletti/">LinkedIn</a></li>
	  </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
