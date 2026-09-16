import "./Dados.css";
import HeaderCadastro from "../../components/cadastro/HeaderCadastro.jsx";
import TituloCadastro from "../../components/cadastro/TituloCadastro.jsx";
import CardCadastro from "../../components/cadastro/CardCadastro.jsx";
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import Botao from "../../components/Button.jsx";

function Dados() {
  return (
    <div className="dados-page">
      <HeaderCadastro
        passo01="passo-concluido"
        passo02="proximo-passo"
        passo03="proximo-passo"
      />

      <main className="dados-content">
        <TituloCadastro
          icone="bi bi-buildings-fill"
          titulo="Cadastro de Empresa"
          subtitulo="etapa 1 de 2 - preencher formulário de inscrição"
        />

        <CardCadastro
          titulo="Dados da Empresa"
          subtitulo="Informações principais da empresa."
        >
          <Input
            id="razaoSocial"
            titulo="Razão Social"
            tipo="text"
            textoDeFundo="Tecnologia"
          />

          <Input
            id="nomeEmpresa"
            titulo="Nome da Empresa"
            tipo="text"
            textoDeFundo="Shelby LTDA"
          />

          <Input
            id="cnpj"
            titulo="CNPJ"
            tipo="text"
            textoDeFundo="12.345.678/0001-95"
          />

          <Input
            id="ramoAtividade"
            titulo="Ramo de Atividade"
            tipo="text"
            textoDeFundo="manutenção de computadores"
          />

          <div className="campo-full">
            <Input
              id="emailEmpresa"
              titulo="Email"
              tipo="email"
              textoDeFundo="exemplo@gmail.com"
            />
          </div>

          <div className="campo-full">
            <Input
              id="senha"
              titulo="Senha"
              tipo="password"
              textoDeFundo="Cria sua senha"
            />
          </div>

          <Input
            id="cep"
            titulo="CEP"
            tipo="text"
            textoDeFundo="12.345.678/0001-95"
          />

          <Input
            id="cidade"
            titulo="Cidade"
            tipo="text"
            textoDeFundo="manutenção de computadores"
          />

          <Select id="uf" titulo="UF" defaultValue="MG">
            <option value="">Selecione</option>
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RS">RS</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </Select>

          <div className="campo-telefone">
            <Input
              id="telefone"
              titulo="Telefone"
              tipo="tel"
              textoDeFundo="(55) 33 988123456"
            />
          </div>

          <Input
            id="dataInicio"
            titulo="Data de Início do Convênio"
            tipo="date"
          />

          <Input
            id="dataFim"
            titulo="Data de Fim do Convênio"
            tipo="date"
          />
        </CardCadastro>

        <CardCadastro
          titulo="Dados do Supervisor de Estágio"
          subtitulo="Responsável pelo acompanhamento do estágio."
        >
          <Input
            id="nomeSupervisor"
            titulo="Nome"
            tipo="text"
            textoDeFundo="Marcos"
          />

          <Input
            id="cargoSupervisor"
            titulo="Cargo"
            tipo="text"
            textoDeFundo="CEO"
          />

          <div className="campo-full">
            <Input
              id="emailSupervisor"
              titulo="Email"
              tipo="email"
              textoDeFundo="exemplo@gmail.com"
            />
          </div>
        </CardCadastro>

        <div className="area-botao">
          <Botao className="btn-proximo" href="/sage/cadastro/documento" texto="Próximo" />
        </div>
      </main>
    </div>
  );
}

export default Dados;