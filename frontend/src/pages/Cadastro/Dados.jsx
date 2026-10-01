import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Dados.css";
import HeaderCadastro from "../../components/cadastro/HeaderCadastro.jsx";
import TituloCadastro from "../../components/cadastro/TituloCadastro.jsx";
import CardCadastro from "../../components/cadastro/CardCadastro.jsx";
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import Botao from "../../components/Button.jsx";
import Footer from "../../components/Footer.jsx";
import {
  cadastroEmpresaVazio,
  mascararCep,
  mascararCnpj,
  mascararTelefone,
  validarCadastroEmpresa,
} from '../../utils/cadastroEmpresa.js';

const CHAVE_CADASTRO = 'sage-cadastro-empresa';

function obterDadosSalvos() {
  try {
    const salvo = sessionStorage.getItem(CHAVE_CADASTRO);
    return salvo ? { ...cadastroEmpresaVazio, ...JSON.parse(salvo), senha: '' } : cadastroEmpresaVazio;
  } catch {
    return cadastroEmpresaVazio;
  }
}

function Campo({ nome, erro, children, className = '' }) {
  return (
    <div className={`campo-cadastro ${className}`.trim()}>
      {children}
      {erro && <p id={`${nome}-erro`} className="campo-cadastro-erro" role="alert">{erro}</p>}
    </div>
  );
}

function Dados() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(obterDadosSalvos);
  const [tocados, setTocados] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const erros = validarCadastroEmpresa(dados);
  const erroVisivel = (campo) => (tentouEnviar || tocados[campo]) ? erros[campo] : '';
  const propriedadesCampo = (campo) => ({
    value: dados[campo],
    onSubmit: (evento) => { evento.preventDefault(); avancar(); },
    onBlur: () => setTocados((atuais) => ({ ...atuais, [campo]: true })),
    isInvalid: Boolean(erroVisivel(campo)),
    'aria-describedby': erroVisivel(campo) ? `${campo}-erro` : undefined,
    required: true,
  });
  const atualizar = (campo, valor) => setDados((atuais) => ({ ...atuais, [campo]: valor }));
  const alterar = (campo, mascara) => (evento) => atualizar(campo, mascara ? mascara(evento.target.value) : evento.target.value);

  const avancar = () => {
    setTentouEnviar(true);
    if (Object.keys(erros).length > 0) {
      const primeiroCampo = Object.keys(erros)[0];
      requestAnimationFrame(() => document.getElementById(primeiroCampo)?.focus());
      return;
    }
    sessionStorage.setItem(CHAVE_CADASTRO, JSON.stringify({ ...dados, senha: undefined }));
    navigate('/sage/cadastro/documento', { state: { cadastroEmpresa: dados } });
  };

  return (
    <div className="dados-page">
      <HeaderCadastro passo01="passo-concluido" passo02="proximo-passo" />
      <main className="dados-content">
        <TituloCadastro icone="bi bi-buildings-fill" titulo="Cadastro de Empresa"
          subtitulo="Etapa 1 de 2 — preencha os dados da empresa e do supervisor" />

        <CardCadastro titulo="Dados da Empresa" subtitulo="Informações principais da empresa.">
          <Campo nome="razaoSocial" erro={erroVisivel('razaoSocial')}>
            <Input id="razaoSocial" titulo="Razão social" tipo="text" placeholder="Ex.: Shelby Tecnologia Ltda."
              maxLength={120} autoComplete="organization" {...propriedadesCampo('razaoSocial')} onChange={alterar('razaoSocial')} />
          </Campo>
          <Campo nome="nomeEmpresa" erro={erroVisivel('nomeEmpresa')}>
            <Input id="nomeEmpresa" titulo="Nome fantasia" tipo="text" placeholder="Ex.: Shelby"
              maxLength={100} {...propriedadesCampo('nomeEmpresa')} onChange={alterar('nomeEmpresa')} />
          </Campo>
          <Campo nome="cnpj" erro={erroVisivel('cnpj')}>
            <Input id="cnpj" titulo="CNPJ" tipo="text" placeholder="00.000.000/0000-00" inputMode="numeric"
              maxLength={18} autoComplete="off" {...propriedadesCampo('cnpj')} onChange={alterar('cnpj', mascararCnpj)} />
          </Campo>
          <Campo nome="ramoAtividade" erro={erroVisivel('ramoAtividade')}>
            <Input id="ramoAtividade" titulo="Ramo de atividade" tipo="text" placeholder="Ex.: Tecnologia da informação"
              maxLength={100} {...propriedadesCampo('ramoAtividade')} onChange={alterar('ramoAtividade')} />
          </Campo>
          <Campo nome="emailEmpresa" erro={erroVisivel('emailEmpresa')} className="campo-full">
            <Input id="emailEmpresa" titulo="E-mail institucional" tipo="email" placeholder="contato@empresa.com.br"
              maxLength={160} autoComplete="email" {...propriedadesCampo('emailEmpresa')} onChange={alterar('emailEmpresa')} />
          </Campo>
          <Campo nome="senha" erro={erroVisivel('senha')} className="campo-full">
            <Input id="senha" titulo="Senha" tipo="password" placeholder="Mínimo de 8 caracteres"
              maxLength={72} autoComplete="new-password" {...propriedadesCampo('senha')} onChange={alterar('senha')} />
            <p className="campo-cadastro-ajuda">Use letra maiúscula, letra minúscula e número.</p>
          </Campo>
          <Campo nome="cep" erro={erroVisivel('cep')}>
            <Input id="cep" titulo="CEP" tipo="text" placeholder="00000-000" inputMode="numeric"
              maxLength={9} autoComplete="postal-code" {...propriedadesCampo('cep')} onChange={alterar('cep', mascararCep)} />
          </Campo>
          <Campo nome="cidade" erro={erroVisivel('cidade')}>
            <Input id="cidade" titulo="Cidade" tipo="text" placeholder="Ex.: Almenara"
              maxLength={80} autoComplete="address-level2" {...propriedadesCampo('cidade')} onChange={alterar('cidade')} />
          </Campo>
          <Campo nome="uf" erro={erroVisivel('uf')}>
            <Select id="uf" titulo="UF" autoComplete="address-level1" {...propriedadesCampo('uf')} onChange={alterar('uf')}>
              <option value="">Selecione</option>
              {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </Select>
          </Campo>
          <Campo nome="telefone" erro={erroVisivel('telefone')}>
            <Input id="telefone" titulo="Telefone" tipo="tel" placeholder="(00) 00000-0000" inputMode="tel"
              maxLength={15} autoComplete="tel" {...propriedadesCampo('telefone')} onChange={alterar('telefone', mascararTelefone)} />
          </Campo>
          <Campo nome="dataInicio" erro={erroVisivel('dataInicio')}>
            <Input id="dataInicio" titulo="Início do convênio" tipo="date"
              {...propriedadesCampo('dataInicio')} onChange={alterar('dataInicio')} />
          </Campo>
          <Campo nome="dataFim" erro={erroVisivel('dataFim')}>
            <Input id="dataFim" titulo="Término do convênio" tipo="date" min={dados.dataInicio || undefined}
              {...propriedadesCampo('dataFim')} onChange={alterar('dataFim')} />
          </Campo>
        </CardCadastro>

        <CardCadastro titulo="Dados do Supervisor de Estágio" subtitulo="Responsável pelo acompanhamento do estágio.">
          <Campo nome="nomeSupervisor" erro={erroVisivel('nomeSupervisor')}>
            <Input id="nomeSupervisor" titulo="Nome completo" tipo="text" placeholder="Ex.: Marcos Silva"
              maxLength={120} autoComplete="name" {...propriedadesCampo('nomeSupervisor')} onChange={alterar('nomeSupervisor')} />
          </Campo>
          <Campo nome="cargoSupervisor" erro={erroVisivel('cargoSupervisor')}>
            <Input id="cargoSupervisor" titulo="Cargo" tipo="text" placeholder="Ex.: Analista de sistemas"
              maxLength={100} autoComplete="organization-title" {...propriedadesCampo('cargoSupervisor')} onChange={alterar('cargoSupervisor')} />
          </Campo>
          <Campo nome="emailSupervisor" erro={erroVisivel('emailSupervisor')} className="campo-full">
            <Input id="emailSupervisor" titulo="E-mail" tipo="email" placeholder="supervisor@empresa.com.br"
              maxLength={160} {...propriedadesCampo('emailSupervisor')} onChange={alterar('emailSupervisor')} />
          </Campo>
        </CardCadastro>

        {tentouEnviar && Object.keys(erros).length > 0 && (
          <p className="cadastro-empresa-aviso" role="alert">Revise os campos destacados antes de continuar.</p>
        )}
        <div className="area-botao">
          <Botao className="btn-proximo" texto="Próximo" onClick={avancar} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Dados;
