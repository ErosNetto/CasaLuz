import "./AddAds.css";
import Modal from "react-modal";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

// Components
import Message from "../../Components/Messages/Message";
import MaskedInput from "react-text-mask";
import { NumericFormat } from "react-number-format";

// Hooks
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";

// Redux
import { publishAds } from "../../Slice/adsSlice";
import {
  getZipCode,
  resetZipCode,
  selectZipCodeApi,
  selectZipCodeError,
} from "../../Slice/zipCodeSlice";

Modal.setAppElement("#root");

const AddAds = () => {
  const dispatch = useDispatch();

  const { loading, error, message } = useSelector((state) => state.ads);

  // ZipCode da Api
  const zipCodeApi = useSelector(selectZipCodeApi);
  const zipCodeError = useSelector(selectZipCodeError);
  const [messageZipCode, setMessageZipCode] = useState("");

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isErrorMessageOpen, setIsErrorMessageOpen] = useState(false);
  const [isSuccessMessageOpen, setIsSuccessMessageOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tell, setTell] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [typeOfRealty, setTypeOfRealty] = useState("");
  const [methodOfSale, setMethodOfSale] = useState("");
  const [landMeasurement, setLandMeasurement] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [adsImages, setAdsImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const adsData = {
      title,
      typeOfRealty,
      description,
      price,
      zipCode,
      address,
      district,
      city,
      methodOfSale,
      landMeasurement,
      tell,
      whatsapp,
      bedrooms,
      bathrooms,
    };

    const formData = new FormData();

    for (const key in adsData) {
      formData.append(key, adsData[key]);
    }

    for (let i = 0; i < adsImages.length; i++) {
      formData.append("images", adsImages[i]);
    }

    dispatch(publishAds(formData));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // Se não houver destino, não fazer nada

    const items = Array.from(imagePreviews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImagePreviews(items);
  };

  const handleFile = (e) => {
    const files = e.target.files;

    const imagePreviewsArray = [];
    const adsImagesArray = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      adsImagesArray.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        imagePreviewsArray.push(reader.result);
        if (imagePreviewsArray.length === files.length) {
          setImagePreviews(imagePreviewsArray);
          setAdsImages(adsImagesArray);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Api CEP
  const handleZipCode = () => {
    const cleanedZipCode = zipCode && zipCode.replace("-", "");
    dispatch(getZipCode(cleanedZipCode));

    if (zipCodeError) {
      setMessageZipCode("CEP não encontrado ou não existe.");
    } else {
      console.log(zipCodeError);
      setMessageZipCode("CEP encontrado com sucesso!");
    }
  };

  const openModal = (e) => {
    e.preventDefault();
    if (zipCode) {
      handleZipCode();
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    if (zipCodeApi) {
      setAddress(zipCodeApi.logradouro || "");
      setDistrict(zipCodeApi.bairro || "");
      setCity(zipCodeApi.localidade || "");
    }
    console.log(zipCodeError);
    dispatch(resetZipCode());
    setMessageZipCode("");
    setIsOpen(false);
  };

  const closeErrorMessage = () => {
    setIsErrorMessageOpen(false);
  };

  const closeSuccessMessage = () => {
    setIsSuccessMessageOpen(false);
  };

  return (
    <div className="createAds">
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <h1>Pesquisando CEP</h1>
        {messageZipCode && <p>{messageZipCode}</p>}

        <button onClick={closeModal}>Fechar</button>
      </Modal>

      {error && (
        <Message
          msg={error}
          type="error"
          isOpen={isErrorMessageOpen}
          onRequestClose={closeErrorMessage}
        />
      )}

      {message && (
        <Message
          msg={message}
          type="success"
          isOpen={isSuccessMessageOpen}
          onRequestClose={closeSuccessMessage}
        />
      )}
      <h1>
        <span>Adicionar</span> anúncio de imóvel
      </h1>
      <h3>Preencha os campos abaixo para criar um anúncio</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="arquivo" className="foto-perfil">
          <span id="buttonFile">Carregar imagens do imóvel</span>
          <input
            type="file"
            onChange={handleFile}
            name="arquivo"
            id="arquivo"
            multiple
          />
        </label>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="imagePreviews" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="imagePreviews"
              >
                {imagePreviews.map((preview, index) => (
                  <Draggable
                    key={index}
                    draggableId={`preview-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="imagePreviewContainer"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="imagePreview"
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <label>
          <span>Título do anúncio</span>
          <input
            type="text"
            placeholder="Título"
            onChange={(e) => setTitle(e.target.value)}
            value={title || ""}
            required
          />
        </label>
        <label>
          <span>Descrição do imóvel</span>
          <textarea
            placeholder="Escreva a descrição"
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            value={description || ""}
          ></textarea>
        </label>
        <label>
          <span>Categoria do imóvel</span>
          <select
            onChange={(e) => setTypeOfRealty(e.target.value)}
            value={typeOfRealty || ""}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="Casa">Casa</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Terreno">Terreno</option>
            <option value="Comercial">Comercial</option>
          </select>
        </label>
        <label>
          <span>CEP</span>
          <div className="label-input-button">
            <MaskedInput
              mask={[/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/]}
              type="text"
              placeholder="CEP"
              onChange={(e) => setZipCode(e.target.value)}
              value={zipCode || ""}
              required
            />
            <button onClick={openModal}>Verificar CEP</button>
          </div>
        </label>
        <label>
          <span>Endereço</span>
          <input
            type="text"
            placeholder="Endereço"
            onChange={(e) => setAddress(e.target.value)}
            value={address || ""}
            required
          />
        </label>
        <label>
          <span>Bairro</span>
          <input
            type="text"
            placeholder="Bairro"
            onChange={(e) => setDistrict(e.target.value)}
            value={district || ""}
            required
          />
        </label>
        <label>
          <span>Cidade</span>
          <input
            type="text"
            placeholder="Cidade"
            onChange={(e) => setCity(e.target.value)}
            value={city || ""}
            required
          />
        </label>
        <label>
          <span>Tamanho do imóvel (m2)</span>
          <input
            type="number"
            placeholder="Tamanho"
            onChange={(e) => setLandMeasurement(e.target.value)}
            value={landMeasurement || ""}
            required
          />
        </label>
        <label>
          <span>Quartos</span>
          <input
            type="number"
            min={0}
            placeholder="Quartos"
            onChange={(e) => setBedrooms(e.target.value)}
            value={bedrooms || ""}
            required
          />
        </label>
        <label>
          <span>Banheiros</span>
          <input
            type="number"
            min={0}
            placeholder="Banheiros"
            onChange={(e) => setBathrooms(e.target.value)}
            value={bathrooms || ""}
            required
          />
        </label>
        <label>
          <span>Preço do imóvel</span>
          <NumericFormat
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            allowNegative={false}
            decimalScale={2}
            fixedDecimalScale
            onChange={(e) => setPrice(e.target.value)}
            value={price || ""}
            placeholder="Preço"
            required
          />
        </label>
        <label>
          <span>Método de negócio</span>
          <select
            onChange={(e) => setMethodOfSale(e.target.value)}
            value={methodOfSale || ""}
            required
          >
            <option value="">Selecione um método</option>
            <option value="Venda">Venda</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Aluguel e venda">Aluguel e venda</option>
          </select>
        </label>
        <label>
          <span>Telefone do vendedor</span>
          <MaskedInput
            mask={[
              "(",
              /[1-9]/,
              /\d/,
              ")",
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            type="text"
            placeholder="Telefone"
            onChange={(e) => setTell(e.target.value)}
            value={tell || ""}
            required
          />
        </label>
        <label>
          <span>Whatsapp do vendedor</span>
          <MaskedInput
            mask={[
              "(",
              /[1-9]/,
              /\d/,
              ")",
              " ",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              "-",
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
            type="text"
            placeholder="Whatsapp"
            onChange={(e) => setWhatsapp(e.target.value)}
            value={whatsapp || ""}
            required
          />
        </label>
        {!loading && <input type="submit" value="Criar anúncio" />}
        {loading && <input type="submit" disabled value="Aguarde..." />}
      </form>
    </div>
  );
};

export default AddAds;
